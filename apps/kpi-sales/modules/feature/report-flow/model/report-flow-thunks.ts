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
import { modifyDateToReportRequest } from '@/modules/entities/report';
import { ReportHelper } from '@/modules/entities/report/lib/api/report-helper';
import { ReportFilterHelper } from '@/modules/entities/report/lib/api/filter-helper';

const reportHelper = new ReportHelper();
const filterHelper = new ReportFilterHelper();

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

/** Загрузка KPI-отчёта по текущему выбору сотрудников и датам. */
export const getReportData =
    () => async (dispatch: AppDispatch, getState: () => RootState) => {
        const state = getState();
        const { app, department, report } = state;
        const user = app.bitrix.user;

        if (!user || report.isLoading || department.status !== 'ready') {
            return;
        }
        dispatch(reportActions.setLoadingReportStatus(true));

        const users = department.current.length
            ? department.current
            : department.items;
        const { from, to } = modifyDateToReportRequest(
            report.date[ReportDateType.FROM],
            report.date[ReportDateType.TO],
        );

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
        } as unknown as ReportGetRequestDto;

        try {
            const reportResponse = await reportHelper.getReport(reportRequest);

            if (reportResponse) {
                dispatch(
                    reportActions.setFetchedReport({
                        report: reportResponse,
                        dateFieldId: '',
                        actionFieldId: '',
                    }),
                );

                if (reportResponse.length) {
                    const stateFilter = report.filter?.length
                        ? report.filter
                        : null;
                    const rememberFilter = report.savedFilter?.length
                        ? report.savedFilter
                        : null;
                    const filter = reportResponse[0]?.kpi.map(
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
            } else {
                logClient(
                    {
                        title: 'get report data: Report не получен по апи',
                        level: 'error',
                        context: 'getReportData',
                        message: 'fail report data',
                        domain: app.domain,
                        userId: user.ID,
                    },
                    { reportRequest },
                );
            }
        } catch (error) {
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
        } finally {
            dispatch(reportActions.setLoadingReportStatus(false));
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
