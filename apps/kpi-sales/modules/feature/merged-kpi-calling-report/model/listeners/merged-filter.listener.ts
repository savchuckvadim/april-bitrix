import { isAnyOf, ListenerMiddlewareInstance } from '@reduxjs/toolkit';
import type { AppDispatch, RootState, ThunkExtraArgument } from '@/modules/app/model/store';
import { reportActions } from '@/modules/entities/report/model/report-slice';
import { mergedReportActions } from '../MergedReportSlice';

const sameSet = (
    a: readonly (number | string)[],
    b: readonly (number | string)[],
) => a.length === b.length && a.every(item => b.includes(item));

/**
 * Показатели объединённого отчёта и главный фильтр.
 *
 * Сотрудников у объединённого отчёта своих нет — их выбирает главный
 * фильтр, подгонять нечего. Показатели (колонки таблицы) настраиваются
 * отдельно, поэтому СИНК С ГЛАВНЫМ ФИЛЬТРОМ действий: смена набора
 * действий в главном фильтре редактирует сузенный выбор колонок —
 * исчезнувшие из главного убираются, ДОБАВЛЕННЫЕ в главный включаются
 * автоматически (иначе новое действие оставалось бы невидимым в таблице).
 * Пустой выбор — «все колонки», подгонять нечего. Звонковые показатели
 * главным фильтром не управляются — не трогаем.
 *
 * Хранилище выбора колонок одно — блоб UI-настроек (feature/ui-settings).
 */
export const startMergedFilterListeners = (
    listener: ListenerMiddlewareInstance<
        RootState,
        AppDispatch,
        ThunkExtraArgument
    >,
) => {
    // setActionsSelection — перенос действий из черновика по «Применить».
    listener.startListening({
        matcher: isAnyOf(
            reportActions.setCurrentActions,
            reportActions.setActionsSelection,
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
