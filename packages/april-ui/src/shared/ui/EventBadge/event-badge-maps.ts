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
 * «Заявка» — холодное событие, выросшее из лида: клиент нас ЖДЁТ, и путать
 * его с холодным обзвоном нельзя (признак — в
 * entities/EventTask/lib/event-request-type). Пока это отображение поверх
 * типа `xo`; когда бэкенд заведёт xoSite/xoLead, здесь появятся их строки.
 */
export const EVENT_TYPE_TONE: Record<string, Tone> = {
    Холодный: 'event-cold',
    Заявка: 'event-lead',
    Звонок: 'event-warm',
    Презентация: 'event-pres',
    Доработка: 'event-refine',
    Решение: 'event-hot',
    Оплата: 'event-money',
    'Сервисный сигнал': 'event-ss',
    Поставка: 'event-supply',
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
