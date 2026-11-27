import type { Provider } from '../../provider/model/dto';
import type { OfferInvoicePeek } from '../model/types';

type ProviderRqSource = {
    rqId?: Provider['rqId'] | null;
    rq?: { id?: number | string | null } | null;
};

const positiveInt = (value: unknown): number | null => {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
};

/**
 * Набор реквизитов поставщика для нумератора (id из таблицы rqs, целое число).
 * Главный источник — `rq.id`: список поставщиков портала собирается по
 * реквизитам, и `rqId` в нём бэк не заполняет (там пусто или «0»). `rqId` —
 * запасной источник. Нет поставщика или id не число — null.
 */
export const providerRqId = (provider: ProviderRqSource | null | undefined): number | null =>
    positiveInt(provider?.rq?.id) ?? positiveInt(provider?.rqId);

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
