import {
    ReportGetRequestDto,
    ReportFilterSaveRequestDto,
    SavedReportFilterDto,
} from '@workspace/nest-kpi-report-sales-api';
import { AppDispatch, RootState } from '@/modules/app/model/store';
import { logClient } from '@/modules/app/lib/helper/logClient';
import {
    departmentActions,
    buildSelectionV2,
    resolveSavedSelection,
} from '@/modules/entities/department';
import { reportActions } from '@/modules/entities/report/model/report-slice';
import {
    EReportDateMode,
    Filter,
    FilterInnerCode,
    ReportDateType,
} from '@/modules/entities/report';
import { ReportData } from '@/modules/entities/report/model/types/report/report-type';
import { ReportHelper } from '@/modules/entities/report/lib/api/report-helper';
import { ReportFilterHelper } from '@/modules/entities/report/lib/api/filter-helper';
import { safeSocketId } from '@/modules/entities/airtime';
import {
    buildReportFlowRequestKey,
    isCurrentKey,
    schedulePoll,
    setCurrentKey,
} from './report-queue.util';

const reportHelper = new ReportHelper();
const filterHelper = new ReportFilterHelper();

interface ReportFetchOptions {
    /** Повторный POST поллинга/WS: без прелоадера и дедуп-гейта. */
    poll?: boolean;
    /** Пересчитать, игнорируя кэш бэка. */
    forceRefresh?: boolean;
}

/** v2-режим дат ↔ фронтовый EReportDateMode (custom ↔ range). */
const toReportDateMode = (mode: string): EReportDateMode =>
    mode === 'custom' ? EReportDateMode.RANGE : (mode as EReportDateMode);

const toSavedDates = (state: RootState): SavedReportFilterDto['dates'] => {
    const date = state.report.date;
    if (date.mode === EReportDateMode.RANGE) {
        return {
            mode: 'custom',
            from: date[ReportDateType.FROM],
            to: date[ReportDateType.TO],
        };
    }
    return { mode: date.mode as SavedReportFilterDto['dates']['mode'] };
};

/**
 * Применение сохранённого фильтра (даты + выбор сотрудников).
 * Вызывается listener'ом после загрузки структуры отделов; завершается
 * action'ом setSavedFilter — триггером загрузки отчёта и статистики.
 */
export const loadSavedFilter =
    () => async (dispatch: AppDispatch, getState: () => RootState) => {
        const state = getState();
        const { app, department } = state;
        // viewAs: читаем сохранённый фильтр просматриваемого пользователя
        // («как видит он»); запись фильтра в этом режиме заблокирована.
        const user = app.viewAs.user ?? app.bitrix.user;
        if (!user) return;

        let saved: SavedReportFilterDto | null = null;
        try {
            saved = await filterHelper.getSaved(app.domain, Number(user.ID));
        } catch (error) {
            logClient(
                {
                    title: 'saved filter',
                    level: 'error',
                    context: 'loadSavedFilter',
                    message: 'Не удалось загрузить сохранённый фильтр',
                    domain: app.domain,
                    userId: user.ID,
                },
                { error: error instanceof Error ? error.message : error },
            );
        }

        if (saved) {
            const mode = toReportDateMode(saved.dates.mode);
            if (mode === EReportDateMode.RANGE) {
                if (saved.dates.from) {
                    dispatch(
                        reportActions.setChangedDate({
                            typeOfDate: ReportDateType.FROM,
                            value: saved.dates.from,
                        }),
                    );
                }
                if (saved.dates.to) {
                    dispatch(
                        reportActions.setChangedDate({
                            typeOfDate: ReportDateType.TO,
                            value: saved.dates.to,
                        }),
                    );
                }
            } else {
                dispatch(reportActions.setChangedDateMode({ mode }));
            }

            const savedIds = new Set(
                resolveSavedSelection(department.departments, saved),
            );
            if (savedIds.size) {
                // Пересечение с видимым периметром: сохранённый выбор не
                // может расширить права (роль могла измениться).
                const users = department.items.filter(u =>
                    savedIds.has(Number(u.ID)),
                );
                if (users.length) {
                    dispatch(departmentActions.setDepartmentCurrent(users));
                }
            }
        }

        dispatch(
            reportActions.setSavedFilter(
                (saved?.actions as FilterInnerCode[] | undefined) ?? null,
            ),
        );
    };

/**
 * Применение готовых данных KPI-отчёта к слайсам (общая точка для ответа
 * поллинга и WS-события kpi-report:done).
 */
export const applyReportData =
    (data: ReportData[]) =>
    (dispatch: AppDispatch, getState: () => RootState) => {
        const report = getState().report;
        dispatch(
            reportActions.setFetchedReport({
                report: data,
                dateFieldId: '',
                actionFieldId: '',
            }),
        );

        if (data.length) {
            const stateFilter = report.filter?.length ? report.filter : null;
            const rememberFilter = report.savedFilter?.length
                ? report.savedFilter
                : null;
            const filter = data[0]?.kpi.map(
                kpiItem => kpiItem.action,
            ) as Array<Filter>;
            const currentFilter = stateFilter || rememberFilter;

            dispatch(
                reportActions.setFetchedActions({
                    actions: filter,
                    currentFilter,
                }),
            );
            dispatch(
                reportActions.setFetchedFilter({
                    filter,
                    currentFilter,
                }),
            );
        }
        dispatch(reportActions.setLoadingReportStatus(false));
    };

/**
 * Загрузка KPI-отчёта по текущему выбору сотрудников и датам.
 *
 * Режим очереди (mode=queue): мгновенный конверт {status,...}; queued →
 * поллинг раз в 7с + WS kpi-report:done. Смена фильтра БОЛЬШЕ НЕ
 * блокируется активной загрузкой (раньше guard по isLoading молча
 * проглатывал перезапрос, пока висел долгий sync-запрос): новый ключ
 * просто устаревает предыдущий, его ответы отбрасываются.
 */
export const getReportData =
    (options: ReportFetchOptions = {}) =>
    async (dispatch: AppDispatch, getState: () => RootState) => {
        const state = getState();
        const { app, department, report } = state;
        const user = app.bitrix.user;

        if (!user || department.status !== 'ready') {
            return;
        }

        const users = department.current.length
            ? department.current
            : department.items;
        // Каноничный ISO как есть (yyyy-MM-dd, обе границы включительно) —
        // легаси-конверсию dd.MM.yyyy(+1 день) для этой ручки больше не делаем.
        const from = report.date[ReportDateType.FROM];
        const to = report.date[ReportDateType.TO];
        if (!from || !to || !users.length) return;

        const requestKey = buildReportFlowRequestKey(from, to, users);
        // Тот же ключ уже в работе/загружен — не дублируем (poll и
        // forceRefresh проходят всегда).
        if (
            !options.poll &&
            !options.forceRefresh &&
            isCurrentKey('report', requestKey) &&
            report.isLoading
        ) {
            return;
        }
        setCurrentKey('report', requestKey);
        if (!options.poll) {
            dispatch(reportActions.setLoadingReportStatus(true));
        }

        const reportRequest = {
            domain: app.domain,
            filters: {
                dateFrom: from,
                dateTo: to,
                userIds: users.map(u => String(u.ID)),
                departament: users,
                userFieldId: '',
                dateFieldId: '',
                actionFieldId: '',
                currentActions: {},
            },
            mode: 'queue',
            socketId: safeSocketId(),
            forceRefresh: options.poll ? undefined : options.forceRefresh,
        } as unknown as ReportGetRequestDto;

        try {
            const envelope = await reportHelper.getReport(reportRequest);
            // Фильтр сменился, пока летел ответ — он устарел.
            if (!isCurrentKey('report', requestKey)) return;

            if (envelope.status === 'queued') {
                schedulePoll('report', requestKey, () =>
                    void dispatch(getReportData({ poll: true })),
                );
                return;
            }
            if (envelope.status === 'error') {
                dispatch(reportActions.setLoadingReportStatus(false));
                logClient(
                    {
                        title: 'get report data: расчёт упал',
                        level: 'error',
                        context: 'getReportData',
                        message: envelope.message ?? 'Ошибка расчёта отчёта',
                        domain: app.domain,
                        userId: user.ID,
                    },
                    { requestKey },
                );
                return;
            }

            dispatch(
                applyReportData(
                    (envelope.data ?? []) as unknown as ReportData[],
                ),
            );
        } catch (error) {
            if (isCurrentKey('report', requestKey)) {
                dispatch(reportActions.setLoadingReportStatus(false));
            }
            logClient(
                {
                    title: 'get report data',
                    level: 'error',
                    context: 'getReportData',
                    message: 'Ошибка загрузки отчёта',
                    domain: app.domain,
                    userId: user.ID,
                },
                { error: error instanceof Error ? error.message : error },
            );
        }
    };

/**
 * Сохранение фильтра в формате v2 (structural selection) на новый бэк.
 * legacyUserIds заполняется всегда — бэк зеркалирует старые колонки,
 * поэтому legacy online-флоу остаётся рабочим (путь отката).
 * Возвращает true при успешном сохранении — UI показывает «Сохранено»
 * только по факту, а не по клику.
 */
export const saveFilter =
    () => async (dispatch: AppDispatch, getState: () => RootState) => {
        const state = getState();
        const { app, department, report } = state;
        const user = app.bitrix.user;
        // В режиме «Смотреть как…» сохранение запрещено — иначе суперюзер
        // перезатёр бы фильтр просматриваемого (кнопка скрыта, гард —
        // вторая линия обороны).
        if (!user || app.viewAs.user || report.isFilterLoading) return false;

        dispatch(reportActions.setFilterLoadingStatus(true));
        try {
            const selectedIds = new Set(
                department.current.map(u => Number(u.ID)),
            );
            const dto: ReportFilterSaveRequestDto = {
                domain: app.domain,
                userId: Number(user.ID),
                filter: {
                    version: 2,
                    actions: report.filter,
                    dates: toSavedDates(state),
                    selection: buildSelectionV2(
                        department.departments,
                        selectedIds,
                    ),
                    legacyUserIds: [...selectedIds],
                },
            };
            await filterHelper.save(dto);
            return true;
        } catch (error) {
            logClient(
                {
                    title: 'save filter',
                    level: 'error',
                    context: 'saveFilter',
                    message: 'Не удалось сохранить фильтр',
                    domain: app.domain,
                    userId: user.ID,
                },
                { error: error instanceof Error ? error.message : error },
            );
            return false;
        } finally {
            dispatch(reportActions.setFilterLoadingStatus(false));
        }
    };
