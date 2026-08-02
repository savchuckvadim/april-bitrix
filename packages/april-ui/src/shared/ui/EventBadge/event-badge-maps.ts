/**
 * Маппинги бэйджей событий April. Цвета не задаются здесь строками —
 * берутся из единого реестра тонов (`lib/tones.ts`), чтобы статусы
 * совпадали с остальной монорепой.
 *
 * Ключи типов — русские названия типов событий (EV_TYPE в приложениях
 * event-sales / event-service).
 */
import { TONE_SOLID, type Tone } from '../../../lib/tones';

/**
 * Русское название типа события → тон.
 *
 * TODO: появится тип «холодный, но с заявкой» — тон `event-lead` уже заведён
 * (маджента, цвет предварительный). Добавить сюда строку EV_TYPE, когда
 * бэкенд её зафиксирует, и значение `lead` в data-event-type приложения.
 */
export const EVENT_TYPE_TONE: Record<string, Tone> = {
    'Холодный': 'event-cold',
    'Звонок': 'event-warm',
    'Презентация': 'event-pres',
    'Решение': 'event-hot',
    'Оплата': 'event-money',
    'Сервисный сигнал': 'event-ss',
    'Поставка': 'event-supply',
};

export const DEFAULT_EVENT_TYPE_TONE: Tone = 'event-warm';

export const EVENT_TYPE_BADGE_CLASS: Record<string, string> = Object.fromEntries(
    Object.entries(EVENT_TYPE_TONE).map(([name, tone]) => [name, TONE_SOLID[tone]]),
);

export const DEFAULT_EVENT_TYPE_BADGE_CLASS = TONE_SOLID[DEFAULT_EVENT_TYPE_TONE];

export type EventDeadlineStatus = 'no' | 'almost' | 'yes';

/** Бэйдж статуса срока: запланирован / скоро / просрочен. */
export const EVENT_STATUS_BADGE: Record<
    EventDeadlineStatus,
    { label: string; tone: Tone; className: string }
> = {
    no: {
        label: 'запланирован',
        tone: 'success',
        className: TONE_SOLID.success,
    },
    almost: { label: 'скоро', tone: 'warning', className: TONE_SOLID.warning },
    yes: {
        label: 'просрочен',
        tone: 'destructive',
        className: TONE_SOLID.destructive,
    },
};
