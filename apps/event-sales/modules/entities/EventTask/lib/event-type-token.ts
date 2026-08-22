import { EV_PLAN_CODE } from '@/modules/entities/EventPlan/type/event-plan-type';
import { EventTaskEventType } from '../types/event-task-type';

// Бэйджи типов событий живут в @workspace/april-ui (EventTypeBadge).
// Здесь — только маппинг для реактивного data-event-type (var(--event-current)).

/** Значение для data-event-type контейнера (см. april-tokens.css). */
export const getEventTypeAttr = (
    eventType: EventTaskEventType | null | undefined,
): EventTaskEventType => eventType ?? 'warm';

/**
 * Тип события задачи → код плана (обратное planCodeToEventType).
 *
 * Нужен переносу: план должен встать на тот же тип, по которому отчитываемся,
 * а не заставлять менеджера выбирать его заново. Холодные виды сводятся к
 * одному коду `cold` — в справочнике планов их не различают.
 */
export const eventTypeToPlanCode = (
    eventType: EventTaskEventType | null | undefined,
): EV_PLAN_CODE => {
    switch (eventType) {
        case 'xo':
        case 'xoRequest':
        case 'xoLead':
            return EV_PLAN_CODE.COLD;
        case 'presentation':
            return EV_PLAN_CODE.PRESENTATION;
        case 'refine':
            return EV_PLAN_CODE.REFINE;
        case 'hot':
            return EV_PLAN_CODE.HOT;
        case 'moneyAwait':
            return EV_PLAN_CODE.PAY;
        case 'supply':
            return EV_PLAN_CODE.SUPPLY;
        default:
            return EV_PLAN_CODE.WARM;
    }
};

/** Код планируемого события (EV_PLAN_CODE) → тип события для data-event-type. */
export const planCodeToEventType = (
    planCode: string | null | undefined,
): EventTaskEventType => {
    switch (planCode) {
        case 'cold':
            return 'xo';
        case 'presentation':
            return 'presentation';
        case 'refine':
            return 'refine';
        case 'hot':
            return 'hot';
        case 'moneyAwait':
            return 'moneyAwait';
        case 'supply':
            return 'supply';
        case 'warm':
        default:
            return 'warm';
    }
};
