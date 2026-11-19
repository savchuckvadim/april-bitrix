/**
 * Что показать под фильтрами «Разборов звонков». Чистая функция:
 * - forbidden — не руководитель (403), «Раздел доступен руководителям»;
 * - period — период с ошибкой: запрос не уходит, старая таблица не
 *   показывается (вводила бы в заблуждение), текст ошибки — под фильтрами;
 * - error — сбой загрузки: текст и «Повторить»;
 * - loading — первая страница ещё не пришла: скелет таблицы;
 * - empty — под фильтры разборов нет;
 * - table — таблица и страницы (следующая страница грузится поверх старой).
 */
import type { CallsListError, CallsListResponse } from '@/modules/entities/calls-list';

export type CallsListView = 'forbidden' | 'period' | 'error' | 'loading' | 'empty' | 'table';

export function callsListViewOf(state: {
    periodInvalid: boolean;
    error: CallsListError | null;
    data: CallsListResponse | null;
}): CallsListView {
    if (state.error?.kind === 'forbidden') return 'forbidden';
    if (state.periodInvalid) return 'period';
    if (state.error) return 'error';
    if (state.data === null) return 'loading';
    return state.data.total > 0 ? 'table' : 'empty';
}
