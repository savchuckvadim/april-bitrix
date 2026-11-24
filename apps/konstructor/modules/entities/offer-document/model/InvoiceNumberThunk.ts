import type { AppThunk } from '@/modules/app/model/store';
import { updateDealField } from '../../deal';
import type { OfferInvoice } from '../../document-payload/model/dto';
import { InvoiceCounterHelper } from '../lib/api/invoice-counter-helper';
import { INVOICE_DEAL_FIELD_CODE, toInvoiceDealValue, type InvoiceDealField } from '../lib/invoice-deal-field.util';
import { providerRqId } from '../lib/invoice-number.util';
import { isInvoiceRequested } from '../lib/invoice-request.util';
import { selectOfferRequestInvoice } from '../lib/select-invoice';
import { offerDocumentActions } from './OfferDocumentSlice';

const counter = new InvoiceCounterHelper();

/** Ответ updateDealField, когда поля нет на портале: настройка портала, менеджеру нечего исправлять. */
const FIELD_NOT_FOUND = 'Field not found';

const SAVE_ERROR = 'Дата или номер счёта не записались в сделку. Формированию это не мешает.';
const NUMBER_ERROR = 'Не удалось получить номер счёта у нумератора. Повторите или введите номер вручную.';
const NO_RQ_ERROR = 'У поставщика нет реквизитов для нумерации счетов. Введите номер счёта вручную.';

/**
 * Что нумератор хранит для счёта выбранного поставщика (peek, счётчик не
 * растёт): подпись под пустым номером. Зовётся при входе на экран КП (`force`)
 * и слушателем при смене поставщика: тот же набор реквизитов повторно не
 * спрашивается. Поставщик ещё не загружен — ждём его: слушатель повторит
 * вызов, когда он появится. Сбой peek подпись не ломает: показывается общая.
 */
export const peekInvoiceNumber =
    ({ force = false }: { force?: boolean } = {}): AppThunk<Promise<void>> =>
    async (dispatch, getState) => {
        const rqId = providerRqId(getState().documentProvider.current);
        const { invoicePeek } = getState().offerDocument;
        if (!force && invoicePeek.status !== 'idle' && invoicePeek.rqId === rqId) return;

        dispatch(offerDocumentActions.invoicePeekStarted(rqId));
        if (!rqId) return;
        try {
            const value = await counter.peek(rqId);
            dispatch(offerDocumentActions.invoicePeekLoaded({ rqId, value }));
        } catch (error) {
            console.warn('offer-document: значение нумератора счёта не получено', error);
            dispatch(offerDocumentActions.invoicePeekFailed(rqId));
        }
    };

/**
 * Дата или номер счёта из состояния → поле сделки (так же, как экран договора
 * пишет `first_pay_date`). Поля нет на портале — молча пропускаем; другая
 * ошибка — ненавязчивая подсказка на экране. Формирование не блокирует ни то,
 * ни другое.
 */
export const saveOfferInvoiceField =
    (field: InvoiceDealField): AppThunk<Promise<void>> =>
    async (dispatch, getState) => {
        const state = getState();
        const dealId = state.app.dealId;
        if (!dealId) return;
        const value = toInvoiceDealValue(state.offerDocument.invoice[field]);
        const result = await dispatch(updateDealField({ dealId, value, fieldCode: INVOICE_DEAL_FIELD_CODE[field] }));
        if (!updateDealField.rejected.match(result)) {
            dispatch(offerDocumentActions.setInvoiceSaveError(null));
            return;
        }
        if (result.payload === FIELD_NOT_FOUND) return;
        console.warn('offer-document: поле счёта не записано в сделку', result.payload);
        dispatch(offerDocumentActions.setInvoiceSaveError(SAVE_ERROR));
    };

/** Счёт для запроса и причина, по которой формировать нельзя (номер не получен). */
export interface InvoiceTaken {
    invoice: OfferInvoice;
    error: string | null;
}

/**
 * Перед формированием КП (Word и PDF): счёт просят, номер пуст — берём
 * следующий у нумератора (`next`), кладём в состояние и пишем в поле сделки
 * `invoice_number` (запись best-effort). Номер уже есть или счёт не просят —
 * `next` не зовётся и счётчик не растёт. Возвращает счёт для запроса; не
 * удалось получить номер — `error`, формирование прерывается: документ без
 * номера счёта бэк напечатал бы с пустым местом.
 */
export const takeInvoiceNumber = (): AppThunk<Promise<InvoiceTaken>> => async (dispatch, getState) => {
    const state = getState();
    const invoice = selectOfferRequestInvoice(state);
    if (!isInvoiceRequested(invoice) || invoice.invoiceNumber) return { invoice, error: null };

    const rqId = providerRqId(state.documentProvider.current);
    if (!rqId) return { invoice, error: NO_RQ_ERROR };

    let number: string;
    try {
        number = (await counter.next(rqId)).trim();
    } catch (error) {
        console.warn('offer-document: номер счёта не получен', error);
        return { invoice, error: NUMBER_ERROR };
    }
    if (!number) return { invoice, error: NUMBER_ERROR };

    dispatch(offerDocumentActions.setInvoiceNumber(number));
    await dispatch(saveOfferInvoiceField('invoiceNumber'));
    // счётчик сдвинулся: подпись под полем, если его очистят, должна показывать новое значение
    void dispatch(peekInvoiceNumber({ force: true }));
    return { invoice: selectOfferRequestInvoice(getState()), error: null };
};
