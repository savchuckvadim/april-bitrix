/**
 * Маппинги бэйджей событий April (токены тем, см.
 * packages/ui/src/styles/themes/april-tokens.css). Ключи типов — русские
 * названия типов событий (EV_TYPE в приложениях event-sales/event-service).
 */
export const EVENT_TYPE_BADGE_CLASS: Record<string, string> = {
    'Холодный': 'bg-event-cold text-event-cold-foreground',
    'Звонок': 'bg-event-warm text-event-warm-foreground',
    'Презентация': 'bg-event-pres text-event-pres-foreground',
    'Решение': 'bg-event-hot text-event-hot-foreground',
    'Оплата': 'bg-event-money text-event-money-foreground',
    'Сервисный сигнал': 'bg-event-ss text-event-ss-foreground',
    'Поставка': 'bg-event-supply text-event-supply-foreground',
};

export const DEFAULT_EVENT_TYPE_BADGE_CLASS =
    'bg-event-warm text-event-warm-foreground';

export type EventDeadlineStatus = 'no' | 'almost' | 'yes';

/** Бэйдж статуса срока: запланирован / скоро / просрочен. */
export const EVENT_STATUS_BADGE: Record<
    EventDeadlineStatus,
    { label: string; className: string }
> = {
    no: { label: 'запланирован', className: 'bg-success text-success-foreground' },
    almost: { label: 'скоро', className: 'bg-warning text-warning-foreground' },
    yes: { label: 'просрочен', className: 'bg-destructive text-white' },
};
