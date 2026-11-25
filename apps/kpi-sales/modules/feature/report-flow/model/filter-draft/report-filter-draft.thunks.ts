import type { AppDispatch, RootState } from '@/modules/app/model/store';
import { departmentActions } from '@/modules/entities/department/model/department-slice';
import { reportActions } from '@/modules/entities/report/model/report-slice';
import {
    readActiveFilterValues,
    resolveDraftUsers,
} from '../../lib/filter-draft.util';
import { getCallingStatistics } from '../calling-statistics-flow-thunk';
import { getReportData } from '../report-flow-thunks';
import { reportFilterDraftActions } from './report-filter-draft.slice';

/** Открыть панель: черновик — снимок действующего фильтра. */
export const openFilterDraft =
    () => (dispatch: AppDispatch, getState: () => RootState) => {
        const { report, department } = getState();
        dispatch(
            reportFilterDraftActions.opened(
                readActiveFilterValues(report, department.current),
            ),
        );
    };

/** Закрыть панель без «Применить»: черновик выбрасывается, фильтр не меняется. */
export const closeFilterDraft = () => (dispatch: AppDispatch) => {
    dispatch(reportFilterDraftActions.closed());
};

/**
 * Кнопка «Применить»: черновик одним обработчиком переходит в действующий
 * фильтр, панель закрывается, отчёт и статистика звонков запрашиваются по
 * новому фильтру. Все dispatch подряд и синхронно — подписчики состояния
 * сразу видят итоговый фильтр целиком, а не промежуточный.
 *
 * Порядок: сотрудники (пустой выбор — все видимые) → период → действия →
 * закрытие панели → запросы. Если панель не открыта, черновика нет —
 * перезапрашиваются данные по действующему фильтру.
 */
export const applyFilterDraft =
    () => (dispatch: AppDispatch, getState: () => RootState) => {
        const { reportFilterDraft: draft, department } = getState();

        if (draft.isOpen) {
            dispatch(
                departmentActions.setDepartmentCurrent(
                    resolveDraftUsers(draft.userIds, department.items),
                ),
            );
            dispatch(reportActions.setPeriod(draft.date));
            dispatch(reportActions.setActionsSelection(draft.actionCodes));
            dispatch(reportFilterDraftActions.closed());
        }

        void dispatch(getReportData());
        void dispatch(getCallingStatistics());
    };
