import { isAnyOf, ListenerMiddlewareInstance } from '@reduxjs/toolkit';
import { appActions } from '@/modules/app/model/AppSlice';
import {
    AppDispatch,
    RootState,
    ThunkExtraArgument,
} from '@/modules/app/model/store';
import { departmentActions } from '@/modules/entities/department/model/department-slice';
import { reportActions } from '@/modules/entities/report/model/report-slice';
import { mergedReportActions } from '../MergedReportSlice';
import {
    loadMergedFilter,
    saveMergedFilter,
} from '../../lib/merged-filter-storage.util';

const sameSet = (
    a: readonly (number | string)[],
    b: readonly (number | string)[],
) => a.length === b.length && a.every(item => b.includes(item));

/**
 * Локальный фильтр объединённого отчёта:
 * 1) гидратация из localStorage при инициализации (иначе таблица сама
 *    выберет всех) и сохранение при изменении;
 * 2) СИНК С ГЛАВНЫМ ФИЛЬТРОМ: смена состава сотрудников или набора
 *    показателей в главном фильтре редактирует локальный выбор —
 *    исчезнувшие из главного элементы убираются, ДОБАВЛЕННЫЕ в главный
 *    включаются автоматически (иначе новые сотрудники оставались
 *    невидимыми в объединённой таблице, а «мёртвые» висели выбранными).
 *    Звонковые показатели главным фильтром не управляются — не трогаем.
 */
export const startMergedFilterListeners = (
    listener: ListenerMiddlewareInstance<
        RootState,
        AppDispatch,
        ThunkExtraArgument
    >,
) => {
    listener.startListening({
        matcher: isAnyOf(appActions.setAppData),
        effect: async (_action, { dispatch, getState }) => {
            const stored = loadMergedFilter(getState().app.domain);
            if (!stored) return;
            if (stored.selectedUsers.length) {
                dispatch(
                    mergedReportActions.setSelectedUsers(stored.selectedUsers),
                );
            }
            if (stored.selectedActions.length) {
                dispatch(
                    mergedReportActions.setSelectedActions(
                        stored.selectedActions,
                    ),
                );
            }
        },
    });

    listener.startListening({
        matcher: isAnyOf(
            mergedReportActions.setSelectedUsers,
            mergedReportActions.setSelectedActions,
        ),
        effect: async (_action, { getState }) => {
            const { app, mergedReport } = getState();
            saveMergedFilter(app.domain, {
                selectedUsers: mergedReport.selectedUsers,
                selectedActions: mergedReport.selectedActions,
            });
        },
    });

    // Синк локального выбора СОТРУДНИКОВ с главным фильтром.
    listener.startListening({
        matcher: isAnyOf(departmentActions.setDepartmentCurrent),
        effect: async (_action, api) => {
            const { selectedUsers } = api.getState().mergedReport;
            // Пустой выбор = «все» (таблица сама заполнит по новым данным).
            if (!selectedUsers.length) return;

            const toIds = (users: readonly { ID?: string | number }[]) =>
                users
                    .map(user => Number(user.ID))
                    .filter(id => Number.isFinite(id) && id > 0);
            const mainIds = toIds(api.getState().department.current);
            const prevIds = new Set(
                toIds(api.getOriginalState().department.current),
            );
            const mainSet = new Set(mainIds);

            const added = mainIds.filter(id => !prevIds.has(id));
            const next = [
                ...new Set([
                    ...selectedUsers.filter(id => mainSet.has(id)),
                    ...added,
                ]),
            ];

            if (!sameSet(next, selectedUsers)) {
                api.dispatch(mergedReportActions.setSelectedUsers(next));
            }
        },
    });

    // Синк локального выбора ПОКАЗАТЕЛЕЙ с главным фильтром действий.
    listener.startListening({
        matcher: isAnyOf(
            reportActions.setCurrentActions,
            reportActions.setFetchedActions,
        ),
        effect: async (_action, api) => {
            const { selectedActions } = api.getState().mergedReport;
            if (!selectedActions.length) return;

            const names = (filters: readonly { name?: string }[]) =>
                filters
                    .map(filter => filter.name)
                    .filter((name): name is string => Boolean(name));
            const state = api.getState();
            const currentNames = new Set(names(state.report.actions.current));
            const prevNames = new Set(
                names(api.getOriginalState().report.actions.current),
            );
            // Полный словарь KPI-имён: только их разрешено редактировать —
            // звонковые показатели живут вне главного фильтра.
            const kpiNames = new Set(names(state.report.actions.items));

            const added = [...currentNames].filter(
                name => !prevNames.has(name),
            );
            const next = [
                ...new Set([
                    ...selectedActions.filter(
                        name => !kpiNames.has(name) || currentNames.has(name),
                    ),
                    ...added,
                ]),
            ];

            if (!sameSet(next, selectedActions)) {
                api.dispatch(mergedReportActions.setSelectedActions(next));
            }
        },
    });
};
