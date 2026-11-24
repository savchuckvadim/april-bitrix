import { getDocumentCounterNumbers } from '@workspace/nest-konstructor-api';

/**
 * Нумератор счетов поставщика. Единственное место со сгенерированным клиентом
 * счётчика документов; `rqId` — набор реквизитов поставщика.
 */
export class InvoiceCounterHelper {
    private api = getDocumentCounterNumbers();

    /** Текущее значение счётчика, счётчик не растёт: подпись на экране. */
    async peek(rqId: number): Promise<string> {
        const response = await this.api.counterNumberPeekCurrentNumber(rqId, 'invoice');
        return response.number;
    }

    /** Следующий номер: счётчик растёт, номер выдаётся один раз. */
    async next(rqId: number): Promise<string> {
        const response = await this.api.counterNumberGetNextNumber(rqId, 'invoice');
        return response.number;
    }
}
