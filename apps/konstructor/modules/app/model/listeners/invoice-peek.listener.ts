import { isAnyOf, type ListenerMiddlewareInstance } from '@reduxjs/toolkit';
// прямые пути, мимо баррелей: слушатель живёт в оболочке и не должен тянуть за собой UI сущностей
import { peekInvoiceNumber } from '@/modules/entities/offer-document/model/InvoiceNumberThunk';
import { documentProvidertAC } from '@/modules/entities/provider/model/DocumentProviderSlice';
import type { AppDispatch, RootState } from '../store';

/**
 * Смена поставщика (или загрузка поставщиков) → заново спросить нумератор
 * счетов: у каждого поставщика свой счётчик. Пока экран КП ни разу не просил
 * значение (статус idle), слушатель молчит: договор и отчёт о поставке
 * нумератор счетов не читают. Тот же набор реквизитов повторно не
 * спрашивается — это решает сам thunk.
 */
export function setupInvoicePeekListener(listenerMiddleware: ListenerMiddlewareInstance) {
    listenerMiddleware.startListening.withTypes<RootState, AppDispatch>()({
        matcher: isAnyOf(documentProvidertAC.setCurrent, documentProvidertAC.setFetched),
        effect: async (_action, listenerApi) => {
            if (listenerApi.getState().offerDocument.invoicePeek.status === 'idle') return;
            await listenerApi.dispatch(peekInvoiceNumber());
        },
    });
}
