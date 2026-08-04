import { AppDispatch, AppGetState } from '@/modules/app/model/store';
import {
    HistoryListHelper,
    HISTORY_PAGE_SIZE,
} from '../lib/api/history-list-helper';
import {
    getHistoryListRef,
    toHistoryEntry,
    type HistoryEntry,
} from '../lib/history-list';
import { eventHistoryActions } from './EVHistorySlice';

const helper = new HistoryListHelper();

/**
 * Сколько страниц тянем первым запросом.
 *
 * Одна страница (50) для истории живого клиента маловата — менеджер сразу
 * скроллит дальше. Две дают сотню записей за один заход и в большинстве
 * случаев закрывают вопрос; остальное — по кнопке, чтобы не выгребать порталу
 * всю историю ради пары просмотров.
 */
const INITIAL_PAGES = 2;

/**
 * История по компании из портального списка «ОП История».
 *
 * Ленивая: вызывается, когда секция истории появилась на экране, а не при
 * старте приложения. У давнего клиента история — сотни записей, и тянуть её
 * всем подряд незачем.
 */
export const loadEventSalesHistory =
    (options: { reset?: boolean } = {}) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        const history = state.eventHistory;
        if (history.status === 'loading') return;

        const companyId = Number(state.app.bitrix.company?.ID || 0);
        if (!companyId) return;

        const ref = getHistoryListRef(state.portal.portal);
        if (!ref) {
            dispatch(eventHistoryActions.setListMissing());
            return;
        }

        const reset = options.reset ?? history.status === 'idle';
        const startFrom = reset ? 0 : history.next;
        // Догружать нечего — вся история уже на экране.
        if (startFrom === null) return;

        dispatch(eventHistoryActions.setLoading());

        try {
            const pages = reset ? INITIAL_PAGES : 1;
            const collected: HistoryEntry[] = [];
            let start: number | null = startFrom;
            let total: number | null = null;

            for (let page = 0; page < pages && start !== null; page++) {
                const result = await helper.getPage({ ref, companyId, start });

                collected.push(
                    ...result.elements.map(element =>
                        toHistoryEntry(element, ref),
                    ),
                );
                total = result.total ?? total;
                start = result.next;

                // Портал отдал неполную страницу — дальше точно ничего нет.
                if (result.elements.length < HISTORY_PAGE_SIZE) start = null;
            }

            dispatch(
                eventHistoryActions.setPage({
                    items: collected,
                    next: start,
                    total,
                    reset,
                }),
            );
        } catch (error) {
            console.error('loadEventSalesHistory error', error);
            dispatch(eventHistoryActions.setError());
        }
    };
