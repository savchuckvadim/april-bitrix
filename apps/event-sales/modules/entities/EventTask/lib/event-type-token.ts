import { EventTaskEventType } from '../types/event-task-type';

// Бэйджи типов событий живут в @workspace/april-ui (EventTypeBadge).
// Здесь — только маппинг для реактивного data-event-type (var(--event-current)).

/** Значение для data-event-type контейнера (см. april-tokens.css). */
export const getEventTypeAttr = (
    eventType: EventTaskEventType | null | undefined,
): EventTaskEventType => eventType ?? 'warm';

/** Код планируемого события (EV_PLAN_CODE) → тип события для data-event-type. */
export const planCodeToEventType = (
    planCode: string | null | undefined,
): EventTaskEventType => {
    switch (planCode) {
        case 'cold':
            return 'xo';
        case 'presentation':
            return 'presentation';
        case 'hot':
            return 'in_progress';
        case 'moneyAwait':
            return 'money_await';
        case 'supply':
            return 'supply';
        case 'warm':
        default:
            return 'warm';
    }
};
