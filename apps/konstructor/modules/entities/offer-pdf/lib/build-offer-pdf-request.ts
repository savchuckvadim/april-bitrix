import type { OfferWordByTemplateGenerateDto } from '@workspace/nest-konstructor-api';
import type { RootState } from '@/modules/app/model/store';
import { selectCatalog } from '../../catalog';
import { selectClientType } from '../../deal';
import { buildOfferPayload } from '../../document-payload';
import { managerFromBxUser, offerBlocker, offerVariantsFields, toOfferClientType } from '../../offer-document';
import {
    OFFER_PDF_OMITTED_WORD_FIELDS,
    type OfferPdfGenerateRequest,
    type OfferPdfLetter,
    type OfferPdfOmittedWordField,
    type OfferPdfSettings,
    type OfferPdfTemplateCode,
} from '../model/types';

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
 * не требуется.
 */
export const offerPdfRequestBlocker = (state: RootState): string | null => offerBlocker(state, 'pdf');

const trimmedOrUndefined = (value: string): string | undefined => {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
};

/**
 * Word-запрос → PDF-запрос: убираем поля Word-шаблона и счёта, добавляем
 * шаблон, настройки, письмо и номер. Пустые строки не отправляем —
 * бэк подставит свои умолчания.
 */
export const toOfferPdfRequest = (
    payload: OfferWordByTemplateGenerateDto,
    options: OfferPdfRequestOptions,
): OfferPdfGenerateRequest => {
    const omitted = new Set<string>(OFFER_PDF_OMITTED_WORD_FIELDS);
    const base = Object.fromEntries(Object.entries(payload).filter(([key]) => !omitted.has(key))) as Omit<
        OfferWordByTemplateGenerateDto,
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
        letter: appeal || text ? { appeal, text } : undefined,
        documentNumber: trimmedOrUndefined(options.documentNumber),
    };
};

/**
 * Запрос КП в PDF из состояния: содержание — тем же адаптером, что и для
 * Word (document-payload), сверху — шаблон, настройки и письмо. Участники-варианты
 * и настройки сделки уходят полями `variants` и `composition`, когда участники
 * есть. Нечего печатать или участника собрать нельзя — null.
 */
export const buildOfferPdfGenerateRequest = (
    state: RootState,
    options: OfferPdfRequestOptions,
): OfferPdfGenerateRequest | null => {
    if (offerPdfRequestBlocker(state)) return null;
    const { domain, dealId, bitrix } = state.app;
    const provider = state.documentProvider.current;
    if (!dealId || !provider) return null;

    const clientType = toOfferClientType(
        selectClientType(state),
    );

    const payload = buildOfferPayload({
        domain,
        dealId,
        companyId: Number(bitrix.company?.ID) || 0,
        userId: Number(bitrix.user?.ID) || 0,
        providerId: Number(provider.id) || 0,
        templateId: '',
        clientType,
        catalog: selectCatalog(state),
        general: state.rowSet.general,
        alternative: state.rowSet.alternative,
        recipient: state.offerDocument.recipient,
        manager: managerFromBxUser(bitrix.user),
        invoice: state.offerDocument.invoice,
    });
    return payload ? { ...toOfferPdfRequest(payload, options), ...offerVariantsFields(state) } : null;
};
