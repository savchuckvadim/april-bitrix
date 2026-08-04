import type { AppDispatch, RootState } from '@/modules/app/model/store';
import { reportActions } from './report-slice';
import {
    Filter,
    FilterInnerCode,
    ReportDateType,
} from './types/report/report-type';

// Чистые операции сущности отчёта (без кросс-entity оркестрации —
// она в feature/report-flow).

/** Смена даты фильтра (вызов из DatesFilter). */
export const changeDate =
    (typeOfDate: ReportDateType, date: string) =>
    async (dispatch: AppDispatch) => {
        dispatch(reportActions.setChangedDate({ typeOfDate, value: date }));
    };

/** Тоггл действия в фильтре показателей (вызов из ActionsFilter). */
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
