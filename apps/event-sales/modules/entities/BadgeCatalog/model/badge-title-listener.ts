import { isAnyOf } from '@reduxjs/toolkit';
import type { AppStartListening } from '@/modules/app/model/store';
import { eventPlanActions } from '@/modules/entities/EventPlan/model/EventPlanSlice';
import { EV_PLAN_PROP } from '@/modules/entities/EventPlan/type/event-plan-type';
import { PLAN_NAME_MAX_LENGTH } from '@/modules/processes/event/lib/text-limits';
import { resolveAutoTitle } from '../lib/badge-auto-title';
import { selectClientName, selectDefaultTitleBadge } from './selectors';

/**
 * Автоподстановка названия события по его типу (правило — resolveAutoTitle).
 *
 * Срабатывает на всё, что ставит или меняет тип: выбор типа, предвыбор при
 * инициализации и сбросе плана, сужение/расширение списка типов, перенос.
 * Правку самого названия НЕ слушаем: стёр менеджер поле — оно остаётся
 * пустым, пока он не сменит тип.
 */
export const startBadgeTitleListener = (
    startAppListening: AppStartListening,
): void => {
    // Последнее, что подставили сами: отличает автотекст от написанного рукой.
    let lastAutoTitle = '';

    startAppListening({
        matcher: isAnyOf(
            eventPlanActions.setPlanProp,
            eventPlanActions.init,
            eventPlanActions.clean,
            eventPlanActions.setAfterSale,
            eventPlanActions.showAllTypes,
            eventPlanActions.seedFromTask,
        ),
        effect: (action, listenerApi) => {
            if (
                eventPlanActions.setPlanProp.match(action) &&
                action.payload.name !== EV_PLAN_PROP.TYPE
            ) {
                return;
            }
            const state = listenerApi.getState();
            const title = resolveAutoTitle({
                currentName: state.eventPlan[EV_PLAN_PROP.NAME],
                lastAutoTitle,
                hasType: !!state.eventPlan[EV_PLAN_PROP.TYPE].current,
                defaultText: selectDefaultTitleBadge(state)?.text ?? null,
                clientName: selectClientName(state),
                maxLength: PLAN_NAME_MAX_LENGTH,
            });
            if (!title) return;
            lastAutoTitle = title;
            listenerApi.dispatch(
                eventPlanActions.setPlanProp({
                    name: EV_PLAN_PROP.NAME,
                    value: title,
                }),
            );
        },
    });
};
