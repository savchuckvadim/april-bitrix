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
} from '../../department';
import { reportActions } from './report-slice';
import {
    EReportDateMode,
    Filter,
    FilterInnerCode,
    ReportDateType,
} from './types/report/report-type';
import { modifyDateToReportRequest } from '../lib/date-util';
import { ReportHelper } from '../lib/api/report-helper';
import { ReportFilterHelper } from '../lib/api/filter-helper';

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
        const user = app.bitrix.user;
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

export const changeDate =
    (typeOfDate: ReportDateType, date: string) =>
    async (dispatch: AppDispatch) => {
        dispatch(reportActions.setChangedDate({ typeOfDate, value: date }));
    };

export const setCurrentActions =
    (actionCode: FilterInnerCode) =>
    async (dispatch: AppDispatch, getState: () => RootState) => {
        const actions = getState().report.actions;
        const searchingActionInCurrent = actions.current.find(
            (action: Filter) => action.innerCode === actionCode,
        );
        let updtCurrent = [...actions.current];

        if (searchingActionInCurrent) {
            updtCurrent = updtCurrent.filter(
                (action: Filter) => action.innerCode !== actionCode,
            );
        } else {
            const addingAction = actions.items.find(
                (action: Filter) => action.innerCode === actionCode,
            );
            if (addingAction) {
                updtCurrent.push(addingAction);
            }
        }

        dispatch(reportActions.setCurrentFilter(actionCode));
        dispatch(reportActions.setCurrentActions(updtCurrent));
    };

/**
 * Сохранение фильтра в формате v2 (structural selection) на новый бэк.
 * legacyUserIds заполняется всегда — бэк зеркалирует старые колонки,
 * поэтому legacy online-флоу остаётся рабочим (путь отката).
 */
export const saveFilter =
    () => async (dispatch: AppDispatch, getState: () => RootState) => {
        const state = getState();
        const { app, department, report } = state;
        const user = app.bitrix.user;
        if (!user || report.isFilterLoading) return;

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
        } finally {
            dispatch(reportActions.setFilterLoadingStatus(false));
        }
    };
