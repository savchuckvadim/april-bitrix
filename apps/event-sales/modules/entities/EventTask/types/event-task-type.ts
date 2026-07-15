import type { BXDeal, BXTask, Placement } from '@workspace/bx';
import type { PresentationStateCount } from '@/modules/entities/EventPresentation/model/PresSlice';

export type { PresentationStateCount };

export type EventTaskEventType =
    | 'xo'
    | 'warm'
    | 'presentation'
    | 'in_progress'
    | 'money_await'
    | 'event'
    | 'supply'
    | 'ss';

export interface EventTask extends BXTask {
    name: string;
    type: EV_TYPE;
    isExpired: 'no' | 'almost' | 'yes';
    eventType: EventTaskEventType;

    presentation: null | PresentationStateCount;
    dealBase: null | BXDeal;
    originalEventType?: 'presentation' | null;
    isPresentationCanceled?: boolean;
}

export enum EV_TYPE {
    XO = 'Холодный',
    WARM = 'Звонок',
    PRES = 'Презентация',
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
