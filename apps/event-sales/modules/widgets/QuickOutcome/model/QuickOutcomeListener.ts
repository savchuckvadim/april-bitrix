import type { AppStartListening } from '@/modules/app/model/store';
import { eventPlanActions } from '@/modules/entities/EventPlan/model/EventPlanSlice';
import { EV_PLAN_PROP } from '@/modules/entities/EventPlan/type/event-plan-type';
// Прямой путь: барель режима руководителя тянет UI.
import { syncActingFromTask } from '@/modules/features/HeadMode/model/HeadModeThunk';
import { eventActions } from '@/modules/processes/event/model/EventSlice';
import { eventItemActions } from '@/modules/widgets/EventItem/model/EventItemSlice';
import { quickOutcomeActions } from './QuickOutcomeSlice';

/**
 * Реакции быстрого итога («X случилось → сделать Y», правило репо).
 *
 * Режим итога меняет общие правила формы: отчёт записывается на
 * ответственного сделки, следующее событие не планируется. Эти реакции
 * следят, чтобы режим не пережил свой отчёт и не «протёк» в следующее дело:
 * отчёт по обычному делу ушёл бы на чужое имя.
 */
export function startQuickOutcomeListener(startAppListening: AppStartListening) {
    /*
     * Режим живёт только вместе с делом, которое сам открыл. Любая смена
     * дела — открыли другое, закрыли это — заканчивает режим.
     *
     * Свои шаги сюда не попадают: открытие итога включает режим ПОСЛЕ
     * открытия дела, а отмена и очистка выключают его ДО закрытия.
     */
    startAppListening({
        actionCreator: eventItemActions.setEventItemMenuStatus,
        effect: (_action, listenerApi) => {
            if (listenerApi.getState().quickOutcome.kind === null) return;
            listenerApi.dispatch(quickOutcomeActions.closed());
        },
    });

    // Режим закончился — «за кого идёт работа» снова считается от дела.
    startAppListening({
        actionCreator: quickOutcomeActions.closed,
        effect: (_action, listenerApi) => {
            if (listenerApi.getOriginalState().quickOutcome.kind === null) {
                return;
            }
            listenerApi.dispatch(syncActingFromTask());
        },
    });

    // Отчёт ушёл на экран финиша — окно больше не нужно. Сам режим ещё
    // действует: от него зависит повторная отправка после ошибки.
    startAppListening({
        actionCreator: eventActions.setFinishStatus,
        effect: (action, listenerApi) => {
            if (!action.payload.status) return;
            if (!listenerApi.getState().quickOutcome.isOpen) return;
            listenerApi.dispatch(quickOutcomeActions.hidden());
        },
    });

    /*
     * Обновление приложения заново собирает план, и «планировать следующее
     * событие» снова включено. У итога следующего события нет: без возврата
     * окно «Осталось заполнить» потребовало бы тип и срок звонка у продажи.
     */
    startAppListening({
        actionCreator: eventPlanActions.init,
        effect: (_action, listenerApi) => {
            const state = listenerApi.getState();
            if (state.quickOutcome.kind === null) return;
            if (!state.eventPlan[EV_PLAN_PROP.IS_ACTIVE]) return;
            listenerApi.dispatch(
                eventPlanActions.setActiveStatus({ status: false }),
            );
        },
    });
}
