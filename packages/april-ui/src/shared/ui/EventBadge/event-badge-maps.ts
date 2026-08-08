/**
 * Маппинги бэйджей событий April. Цвета не задаются здесь строками —
 * берутся из единого реестра тонов (`lib/tones.ts`), чтобы статусы
 * совпадали с остальной монорепой.
 *
 * Ключи типов — русские названия типов событий (EV_TYPE в приложениях
 * event-sales / event-service).
 */
import { type Tone } from '../../../lib/tones';

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

export type EventDeadlineStatus = 'no' | 'almost' | 'yes';

/** Статус срока: запланирован / скоро / просрочен (бэйдж и подписи срока). */
export const EVENT_STATUS_BADGE: Record<
    EventDeadlineStatus,
    { label: string; tone: Tone }
> = {
    no: { label: 'запланирован', tone: 'success' },
    almost: { label: 'скоро', tone: 'warning' },
    yes: { label: 'просрочен', tone: 'destructive' },
};
