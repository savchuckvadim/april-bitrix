import type { BXDeal, BXTask, Placement } from '@workspace/bx';
import type { PresentationStateCount } from '@/modules/entities/EventPresentation/model/PresSlice';

export type { PresentationStateCount };

/**
 * Коды типов событий — ЕДИНЫЕ с бэком, без легаси-синонимов.
 *
 * Раньше рядом жили пары-двойники: 'event' и 'warm', 'in_progress' и 'hot',
 * 'money_await' и 'moneyAwait'. Каждый такой синоним — это развилка, на
 * которой рано или поздно теряется запись: один кусок кода сравнивает с
 * одним написанием, другой с другим. Оставлен один набор; что как называлось
 * раньше — в docs/event-sales-event-types.md.
 */
export type EventTaskEventType =
    | 'xo'
    | 'xoRequest'
    | 'xoLead'
    | 'warm'
    | 'presentation'
    | 'refine'
    | 'hot'
    | 'moneyAwait'
    | 'supply'
    | 'ss';

export interface EventTask extends BXTask {
    name: string;
    type: EV_TYPE;
    isExpired: 'no' | 'almost' | 'yes';
    eventType: EventTaskEventType;

    /**
     * Дедлайн как его отдал портал (ISO). Поле `deadline` человекочитаемое —
     * его показывают, а считают по этому: план переноса встаёт на дату
     * текущей задачи.
     */
    deadlineRaw: string | null;

    /** Комментарий планирования (pbx-поле UF_TASK_EVENT_COMMENT), null — не заполнен. */
    eventComment: string | null;

    presentation: null | PresentationStateCount;
    dealBase: null | BXDeal;
    originalEventType?: 'presentation' | null;
    isPresentationCanceled?: boolean;
}

export enum EV_TYPE {
    XO = 'Холодный',
    REQUEST = 'Заявка',
    WARM = 'Звонок',
    PRES = 'Презентация',
    REFINE = 'Доработка',
    HOT = 'Решение',
    MONEY = 'Оплата',
    SS = 'Сервисный сигнал',
    SUPPLY = 'Поставка',
}

export interface TasksFetchData {
    domain: string;
    userId: number;
    placement: Placement;
}
