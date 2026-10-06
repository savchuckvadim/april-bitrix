import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import { eventReportActions } from '@/modules/entities/EventReport/model/EventReportSlice';
import { EV_REPORT_PROP } from '@/modules/entities/EventReport/type/event-report-type';
import { WORK_STATUS_ID } from '@/modules/entities/EventReport/lib/report-catalog';
import { eventPlanActions } from '@/modules/entities/EventPlan/model/EventPlanSlice';
import { EV_PLAN_PROP } from '@/modules/entities/EventPlan/type/event-plan-type';
// Прямой путь: барель режима руководителя тянет UI.
import { syncActingFromTask } from '@/modules/features/HeadMode/model/HeadModeThunk';
import {
    EventItemResultType,
    eventItemActions,
} from '@/modules/widgets/EventItem/model/EventItemSlice';
import {
    cancelResultMenu,
    getResultMenu,
} from '@/modules/widgets/EventItem/model/EventItemThunk';
import { send } from '@/modules/processes/event/model/SendThunk';
import {
    QUICK_OUTCOME_WORK_STATUS,
    type QuickOutcomeKind,
    resolveOutcomeOwnerId,
} from '../lib/quick-outcome';
import { quickOutcomeActions } from './QuickOutcomeSlice';

/**
 * Открыть окно итога («Продажа» / «Отказ»).
 *
 * Готовит обычный отчёт «Звонков» — тот же, что собрала бы форма:
 *  1. новое событие без дела (как кнопка «создать»);
 *  2. статус работы — продажа или отказ;
 *  3. следующее событие не планируется: итог финальный;
 *  4. отчёт записывается на ОТВЕТСТВЕННОГО СДЕЛКИ, а не на нажавшего
 *     кнопку (требование владельца) — тем же способом, каким руководитель
 *     отчитывается за сотрудника.
 *
 * Порядок шагов важен: открытие нового события закрывает прежний быстрый
 * итог (если он почему-то остался) и возвращает «за кого идёт работа» на
 * пользователя, поэтому режим итога включается последним — и уже он ставит
 * ответственного сделки общим правилом (syncActingFromTask).
 *
 * @returns false — итог не открыт: статус не применился (у режима отдела
 * нет «Продажи»). Открыть окно в таком виде значило бы записать «в работе».
 */
export const openQuickOutcome =
    (kind: QuickOutcomeKind) =>
    async (dispatch: AppDispatch, getState: AppGetState): Promise<boolean> => {
        const before = getState();
        const restore = {
            workStatusId:
                before.eventReport.report[EV_REPORT_PROP.WORK_STATUS].current
                    .id,
            isPlanActive: before.eventPlan[EV_PLAN_PROP.IS_ACTIVE],
        };

        await dispatch(getResultMenu(EventItemResultType.NEW, null));

        const workStatus = QUICK_OUTCOME_WORK_STATUS[kind];
        dispatch(
            eventReportActions.setReportProp({
                propName: EV_REPORT_PROP.WORK_STATUS,
                value: WORK_STATUS_ID[workStatus],
            }),
        );
        const applied =
            getState().eventReport.report[EV_REPORT_PROP.WORK_STATUS].current
                .code;
        if (applied !== workStatus) {
            await dispatch(cancelResultMenu());
            return false;
        }
        dispatch(eventPlanActions.setActiveStatus({ status: false }));

        const state = getState();
        const deal = state.app.bitrix.deal as unknown as Record<
            string,
            unknown
        > | null;
        dispatch(
            quickOutcomeActions.opened({
                kind,
                restore,
                ownerId: resolveOutcomeOwnerId({
                    dealAssignedById: deal?.ASSIGNED_BY_ID,
                    myId: Number(state.app.bitrix.user?.ID ?? 0),
                }),
            }),
        );
        dispatch(syncActingFromTask());
        return true;
    };

/**
 * Закончить быстрый итог без отправки: форма возвращается в то состояние,
 * в каком была до открытия окна.
 *
 * Зовётся кнопкой «Отмена» и уходом к списку событий (с экрана финиша или
 * из формы после ошибки отправки). Если отчёт к этому моменту уже принят,
 * вернуть форму всё равно безопасно: отправленное лежит в очереди доставки
 * и от формы больше не зависит.
 *
 * Комментарий остаётся: он общий с формой дела и сохранён черновиком —
 * после неудачной отправки его не придётся набирать заново.
 */
export const cancelQuickOutcome =
    () => async (dispatch: AppDispatch, getState: AppGetState) => {
        const { kind, restore } = getState().quickOutcome;
        if (kind === null) return;

        // Строго ДО закрытия дела: закрытие возвращает «за кого идёт
        // работа» на пользователя, и при живом режиме итога ответственным
        // остался бы ответственный сделки.
        dispatch(quickOutcomeActions.closed());
        dispatch(eventItemActions.setPreflightOpen({ isOpen: false }));
        await dispatch(cancelResultMenu());
        if (!restore) return;
        dispatch(
            eventReportActions.setReportProp({
                propName: EV_REPORT_PROP.WORK_STATUS,
                value: restore.workStatusId,
            }),
        );
        dispatch(
            eventPlanActions.setActiveStatus({ status: restore.isPlanActive }),
        );
    };

/**
 * Отправить итог обычным потоком отчёта: проверка заполненности (окно
 * «Осталось заполнить»), обязательные анкеты, очередь отправки — всё как
 * у формы дела.
 */
export const submitQuickOutcome = () => async (dispatch: AppDispatch) => {
    await dispatch(send());
};
