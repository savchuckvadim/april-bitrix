import { EVENT_ROUTE_PATH } from './event-routes';
import { ROUTE_EVENT } from '../types/event-types';

export interface ResetItemFormInput {
    /** Роут предыдущего рендера. */
    from: string | null;
    /** Роут сейчас. */
    to: string;
    /** Меню результата открыто — есть что сбрасывать. */
    isMenuActive: boolean;
}

/**
 * Пора ли сбросить форму отчёта.
 *
 * Правило — именно ПЕРЕХОД «дело → список», а не «мы на списке»: открытие дела
 * ставит состояние синхронно (getResultMenu), пока pathname ещё '/', и правило
 * «на списке и меню активно» стирало бы только что открытое дело — на /item
 * приезжала пустая форма без задачи и без типа результата.
 *
 * Сам сброс делается уже после ухода с формы: если чистить состояние до
 * router.push, уходящая форма секунду показывает «Новое событие» с чужой
 * раскраской и блоком недозвона.
 */
export const shouldResetItemForm = ({
    from,
    to,
    isMenuActive,
}: ResetItemFormInput): boolean =>
    isMenuActive &&
    from === EVENT_ROUTE_PATH[ROUTE_EVENT.ITEM] &&
    to === EVENT_ROUTE_PATH[ROUTE_EVENT.LIST];

export interface LeaveQuickOutcomeInput {
    /** Роут предыдущего рендера. */
    from: string | null;
    /** Роут сейчас. */
    to: string;
    /** Идёт быстрый итог («Продажа» / «Отказ»). */
    isQuickOutcome: boolean;
}

/**
 * Пора ли закончить быстрый итог.
 *
 * Итог открывается и отправляется ПРЯМО НА СПИСКЕ, поэтому правило — тоже
 * переход, а не «мы на списке»: к списку пришли с экрана финиша (отчёт ушёл
 * либо менеджер отказался от повтора после ошибки) или из формы дела, куда
 * финиш вернул дозаполнять. В обоих случаях итог закончен — режим нельзя
 * оставлять включённым: следующий отчёт ушёл бы на ответственного сделки.
 */
export const shouldLeaveQuickOutcome = ({
    from,
    to,
    isQuickOutcome,
}: LeaveQuickOutcomeInput): boolean =>
    isQuickOutcome &&
    from !== null &&
    from !== EVENT_ROUTE_PATH[ROUTE_EVENT.LIST] &&
    to === EVENT_ROUTE_PATH[ROUTE_EVENT.LIST];
