import type { AppDispatch, RootState } from '@/modules/app/model/store';
import { departmentActions } from '@/modules/entities/department/model/department-slice';
import { reportActions } from '@/modules/entities/report/model/report-slice';
import {
    readActiveFilterValues,
    resolveDraftUsers,
} from '../../lib/filter-draft.util';
import { getCallingStatistics } from '../calling-statistics-flow-thunk';
import { activeReportDataNeeds } from '../report-data-demand';
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
 * фильтр, панель закрывается, события и звонки запрашиваются по новому
 * фильтру — но только те, что нужны текущей вкладке или заявлены
 * потребителем вне вкладки (activeReportDataNeeds). Все dispatch подряд и
 * синхронно — подписчики состояния сразу видят итоговый фильтр целиком, а
 * не промежуточный.
 *
 * Действующий фильтр меняется всегда. Вкладке без нужд («Дайджест»,
 * «Финансы», «AI аналитика») запросы не уходят, а отметки «загружено» остаются
 * от старого ключа: при переходе на вкладку отчёта ensureReportData увидит
 * новый фильтр и запросит данные. Повторное «Применить» с тем же фильтром
 * на вкладке отчёта запрос отправляет — пользователь хочет обновить.
 *
 * Порядок: сотрудники (пустой выбор — все видимые) → период → действия →
 * закрытие панели → запросы. Если панель не открыта, черновика нет —
 * перезапрашиваются данные по действующему фильтру.
 *
 * Действия переносятся, только когда их список загружен. Список приходит с
 * событиями: на вкладке без событий его ещё нет, панель действий не
 * показывает, и черновик о них ничего не знает — переносить пустой набор
 * значило бы стереть действующий выбор.
 */
export const applyFilterDraft =
    () => (dispatch: AppDispatch, getState: () => RootState) => {
        const { reportFilterDraft: draft, department, report } = getState();

        if (draft.isOpen) {
            dispatch(
                departmentActions.setDepartmentCurrent(
                    resolveDraftUsers(draft.userIds, department.items),
                ),
            );
            dispatch(reportActions.setPeriod(draft.date));
            if (report.actions.items.length) {
                dispatch(reportActions.setActionsSelection(draft.actionCodes));
            }
            dispatch(reportFilterDraftActions.closed());
        }

        const needs = activeReportDataNeeds(getState().reportType.current);
        if (needs.events) void dispatch(getReportData());
        if (needs.callings) void dispatch(getCallingStatistics());
    };
