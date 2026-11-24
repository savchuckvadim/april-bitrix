import type { RootState } from '@/modules/app/model/store';
import { selectCatalog } from '../../catalog';
import { selectClientType } from '../../deal';
import { buildOfferPayload, type OfferGenerateRequest, type OfferInvoice } from '../../document-payload';
import {
    alternativeComplectsFields,
    managerFromBxUser,
    offerBlocker,
    offerGenerateBlocker,
    toOfferClientType,
} from '../../offer-document';
import {
    OFFER_PDF_OMITTED_WORD_FIELDS,
    type OfferPdfGenerateRequest,
    type OfferPdfLetter,
    type OfferPdfOmittedWordField,
    type OfferPdfSettings,
    type OfferPdfTemplateCode,
} from '../model/types';
import { offerPdfVariantsFields } from './offer-pdf-variants';

export interface OfferPdfRequestOptions {
    /** Код стиля из списка стилей бэка */
    templateCode: OfferPdfTemplateCode;
    palette: string | null;
    settings: OfferPdfSettings;
    letter: OfferPdfLetter;
    documentNumber: string;
}

/**
 * Почему PDF сейчас не собрать — подпись к кнопке; null — можно. Проверки
 * общие с Word-потоком (offerBlocker): сделка, главная строка, поставщик,
 * стадии вариантов, участники, которых собрать нельзя. Word-шаблон PDF
 * не требуется. Блокер превью и сборки запроса: тип клиента он не проверяет.
 */
export const offerPdfRequestBlocker = (state: RootState): string | null => offerBlocker(state, 'pdf');

/**
 * Почему PDF нельзя сформировать — подпись к кнопке «Сформировать PDF»; null —
 * можно. К блокерам превью добавляется обязательный тип клиента (по нему бэк
 * подбирает шаблон счёта), тем же текстом, что у Word.
 */
export const offerPdfGenerateBlocker = (state: RootState): string | null => offerGenerateBlocker(state, 'pdf');

/**
 * Запрос формирования PDF: запрос превью плюс счёт. Превью счёта не рисует,
 * поэтому в его запросе и ключе `invoice` нет (OFFER_PDF_OMITTED_WORD_FIELDS), и
 * правка счёта превью не пересобирает. Шаблон счёта бэк подбирает сам:
 * `invoiceTemplateId` пустой.
 */
export const withOfferPdfInvoice = (request: OfferPdfGenerateRequest, invoice: OfferInvoice): OfferPdfGenerateRequest => ({
    ...request,
    invoice,
    invoiceTemplateId: '',
});

const trimmedOrUndefined = (value: string): string | undefined => {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
};

/**
 * Word-запрос → PDF-запрос превью: убираем поля Word-шаблона и счёта (счёт
 * возвращает withOfferPdfInvoice в запросе формирования), добавляем
 * шаблон, настройки, письмо, номер и способ печати наполнения комплектов
 * (`complectsMode` — полем верхнего уровня, в `settings` бэка его нет).
 * Разделы по комплектам (`complects`) приходят из Word-запроса. Пустые
 * строки не отправляем — бэк подставит свои умолчания.
 */
export const toOfferPdfRequest = (
    payload: OfferGenerateRequest,
    options: OfferPdfRequestOptions,
): OfferPdfGenerateRequest => {
    const omitted = new Set<string>(OFFER_PDF_OMITTED_WORD_FIELDS);
    const base = Object.fromEntries(Object.entries(payload).filter(([key]) => !omitted.has(key))) as Omit<
        OfferGenerateRequest,
        OfferPdfOmittedWordField
    >;
    const appeal = trimmedOrUndefined(options.letter.appeal);
    const text = trimmedOrUndefined(options.letter.text);

    return {
        ...base,
        templateCode: options.templateCode,
        palette: options.palette ?? undefined,
        settings: {
            descriptionMode: options.settings.descriptionMode,
            viewMode: options.settings.viewMode,
            withStamps: options.settings.withStamps,
            withManager: options.settings.withManager,
            isPriceFirst: options.settings.isPriceFirst,
            salePhrase: trimmedOrUndefined(options.settings.salePhrase) ?? null,
            withCover: options.settings.withCover,
            withPromo: options.settings.withPromo,
        },
        complectsMode: options.settings.complectsMode,
        letter: appeal || text ? { appeal, text } : undefined,
        documentNumber: trimmedOrUndefined(options.documentNumber),
    };
};

/**
 * Запрос КП в PDF из состояния: содержание — тем же адаптером, что и для
 * Word (document-payload), сверху — шаблон, настройки и письмо. Участники-варианты
 * и настройки сделки уходят полями `variants` и `composition`, когда участники
 * есть; у каждого участника свой способ печати наполнения (offerPdfVariantsFields).
 * Настройка «Наполнение наборов для сравнения» включена и у наборов есть
 * наполнение — к запросу и к каждому участнику добавляется `alternativeComplects`;
 * иначе поля нет. Нечего печатать или участника собрать нельзя — null.
 */
export const buildOfferPdfGenerateRequest = (
    state: RootState,
    options: OfferPdfRequestOptions,
): OfferPdfGenerateRequest | null => {
    if (offerPdfRequestBlocker(state)) return null;
    const { domain, dealId, bitrix } = state.app;
    const provider = state.documentProvider.current;
    if (!dealId || !provider) return null;

    // тип клиента из шапки; формирование без него заблокировано (offerPdfGenerateBlocker), превью печатается как для организации
    const clientType = toOfferClientType(selectClientType(state));

    const catalog = selectCatalog(state);
    const payload = buildOfferPayload({
        domain,
        dealId,
        companyId: Number(bitrix.company?.ID) || 0,
        userId: Number(bitrix.user?.ID) || 0,
        providerId: Number(provider.id) || 0,
        templateId: '',
        clientType,
        catalog,
        general: state.rowSet.general,
        alternative: state.rowSet.alternative,
        recipient: state.offerDocument.recipient,
        manager: managerFromBxUser(bitrix.user),
        invoice: state.offerDocument.invoice,
    });
    if (!payload) return null;
    return {
        ...toOfferPdfRequest(payload, options),
        // наполнение наборов для сравнения: настройка экрана, наборы — живые, как и тело запроса
        ...alternativeComplectsFields('pdf', options.settings.alternativeComplects, catalog, state.rowSet.alternative),
        ...offerPdfVariantsFields(state, options.settings),
    };
};
