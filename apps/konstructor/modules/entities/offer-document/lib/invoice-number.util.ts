import type { Provider } from '../../provider/model/dto';
import type { OfferInvoicePeek } from '../model/types';

/**
 * Набор реквизитов поставщика для нумератора: у поставщика он лежит строкой
 * (`rqId`, id из таблицы rqs), нумератор ждёт целое число. Нет поставщика или
 * id не число — null.
 */
export const providerRqId = (provider: Pick<Provider, 'rqId'> | null | undefined): number | null => {
    const id = Number(provider?.rqId);
    return Number.isInteger(id) && id > 0 ? id : null;
};

/** Подпись, когда значение нумератора узнать не удалось. */
export const INVOICE_NUMBER_HINT_UNKNOWN = 'номер присвоит нумератор при формировании';

/**
 * Подпись под полем «Номер счёта». Номер уже есть в поле — подписи нет. Поле
 * пустое: показываем, что сейчас хранит нумератор. Peek отдаёт текущее
 * значение счётчика (последний выданный номер), а `next` при формировании
 * выдаст следующее, поэтому подпись говорит о текущем значении и не обещает
 * его как номер счёта. Ответа ещё нет — подписи нет; peek не удался —
 * общая подпись.
 */
export const invoiceNumberHint = (invoiceNumber: string, peek: OfferInvoicePeek): string | null => {
    if (invoiceNumber.trim()) return null;
    if (peek.status === 'ready' && peek.value) {
        return `сейчас в нумераторе № ${peek.value}, при формировании присвоится следующий`;
    }
    if (peek.status === 'failed') return INVOICE_NUMBER_HINT_UNKNOWN;
    return null;
};
