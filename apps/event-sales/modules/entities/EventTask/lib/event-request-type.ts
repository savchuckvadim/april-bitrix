import { getCrmLinksFromRaw } from './task-links';
import { EV_TYPE } from '../types/event-task-type';
import type { EventTaskEventType } from '../types/event-task-type';

/**
 * Холодный звонок по ЗАЯВКЕ — это другая работа.
 *
 * «Холодный» означает, что клиент нас не ждёт. Но если событие выросло из
 * заявки (лид с сайта или входящее обращение), клиент нас как раз ждёт — и
 * менеджер, увидев в ленте «Холодный», настраивается не на тот разговор.
 * Признак берём из привязок задачи: есть лид — значит заявка.
 *
 * Пока это отображение поверх существующего типа `xo`: бэкенд отдельных
 * `xoSite`/`xoLead` ещё не знает (Волна 7.2 в tasks-доке). Сюда же добавится
 * различие «сайт vs лид», когда типы появятся на бэке.
 */

/** Тип события, показываемый менеджеру, — с учётом заявки. */
export const EV_TYPE_REQUEST = 'Заявка';

export interface RequestTypeInput {
    /** Тип события задачи (xo, warm, presentation, …). */
    eventType: EventTaskEventType | null | undefined;
    /** Русское имя типа, которое показывает бэйдж. */
    type: string;
    /** Сырые CRM-привязки задачи (UF_CRM_TASK). */
    ufCrmTask?: string[] | null;
}

/** Заявка ли это: холодное событие, у которого есть привязанный лид. */
export const getIsRequestEvent = ({
    eventType,
    ufCrmTask,
}: Pick<RequestTypeInput, 'eventType' | 'ufCrmTask'>): boolean => {
    // Явные типы — источник истины: их ставит робот воронки заявок словом в
    // заголовке задачи («Холодный звонок. Заявка» / «. Лид»).
    if (eventType === 'xoRequest' || eventType === 'xoLead') return true;
    // Старые задачи заведены до появления типов: там признак — привязанный лид.
    return eventType === 'xo' && getCrmLinksFromRaw(ufCrmTask).leadIds.length > 0;
};

/**
 * Имя типа для бэйджа: у заявки своё слово и свой цвет (тон `event-lead`),
 * у остальных — как было.
 */
export const getEventTypeLabel = (input: RequestTypeInput): string =>
    getIsRequestEvent(input) ? EV_TYPE_REQUEST : (input.type ?? EV_TYPE.WARM);
