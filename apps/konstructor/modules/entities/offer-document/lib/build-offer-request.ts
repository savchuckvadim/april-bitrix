import type { OfferWordMultiGenerateDto } from '@workspace/nest-konstructor-api';
import type { RootState } from '@/modules/app/model/store';
import { IS_PROD } from '@/modules/app/consts/app-global';
import { selectCatalog } from '../../catalog';
import { selectOfferComposition, selectVariantStagesLoading } from '../../complect-variant';
import { selectClientType } from '../../deal';
import {
    buildOfferPayload,
    type DocComplectsFields,
    type DocVariant,
    type OfferGenerateRequest,
} from '../../document-payload';
import { findMainRow } from '../../row-set';
import type { OfferSalesFlowFields } from '../model/types';
import { clientTypeBlocker, toOfferClientType } from './client-type.util';
import { presentationBlocker } from './presentation-choice.util';
import { selectOfferRequestInvoice } from './select-invoice';
import { selectOfferSalesFlowFields } from './select-sales-flow';
import { managerFromBxUser } from './manager.util';
import {
    alternativeComplectsFields,
    selectAlternativeComplectsEnabled,
    withAlternativeComplects,
} from './offer-alternative-complects';
import { selectOfferVariantsPayload } from './select-variants-payload';
import { skippedVariantsBlocker } from './skipped-variants-blocker';

/** Формат КП: Word требует выбранный шаблон, PDF собирается из встроенного стиля. */
export type OfferBlockerFormat = 'word' | 'pdf';

/**
 * Что мешает собрать само КП (шапка, шаблон Word, поставщик, стадии вариантов)
 * без проверки участников. Проверки общие для Word и PDF; шаблон спрашивается
 * только у Word.
 */
const offerBaseBlocker = (state: RootState, format: OfferBlockerFormat): string | null => {
    if (!state.app.domain) return 'Приложение не инициализировано';
    if (!state.app.dealId) return 'Сначала сохраните сделку — КП прикрепляется к ней';
    if (!findMainRow(state.rowSet.general)) return 'Нет главной строки: соберите комплект';
    if (format === 'word' && !state.offerTemplateWord.selectedTemplate) return 'Выберите шаблон КП';
    if (!state.documentProvider.current) return 'Выберите поставщика';
    // стадии вариантов ещё в пути — кто участвует в КП, пока неизвестно
    if (selectVariantStagesLoading(state)) return 'Варианты КП ещё загружаются';
    return null;
};

/**
 * Почему КП в заданном формате сейчас не собрать — подпись к заблокированной
 * кнопке; null — можно. Открытый вариант, который собрать нельзя, тоже
 * блокирует: молча он выпал бы из КП, и менеджер узнал бы об этом по готовому
 * документу. Один блокер на Word и PDF, на формирование и превью. Режим сделки
 * на КП не влияет: оно всегда идёт по открытому варианту.
 */
export const offerBlocker = (state: RootState, format: OfferBlockerFormat): string | null =>
    offerBaseBlocker(state, format) ?? skippedVariantsBlocker(selectOfferVariantsPayload(state).skipped);

/** Блокер КП в Word: формирование и превью. */
export const offerRequestBlocker = (state: RootState): string | null => offerBlocker(state, 'word');

/**
 * Почему КП в заданном формате нельзя сформировать — подпись к кнопке
 * «Сформировать»; null — можно. К блокерам offerBlocker добавляются тип клиента
 * (он обязателен, по нему бэк подбирает шаблон счёта) и выбор презентации: на
 * «Да» при нескольких презентациях КП без выбора не уходит. Превью этими
 * блокерами не закрывается: оно собирается по offerBlocker.
 */
export const offerGenerateBlocker = (state: RootState, format: OfferBlockerFormat): string | null =>
    offerBlocker(state, format) ??
    clientTypeBlocker(selectClientType(state)) ??
    presentationBlocker(state.offerDocument.presentation);

/** Блокер формирования КП в Word (кнопка и thunk). */
export const offerWordGenerateBlocker = (state: RootState): string | null => offerGenerateBlocker(state, 'word');

/**
 * Необязательные поля превью и PDF-КП: открытый вариант и настройки сделки.
 * Форма та же, что у generate-multi; у участника есть разделы по комплектам
 * (`complects`), которых в сгенерированном типе пока нет.
 */
export type OfferVariantsFields = Partial<Pick<OfferWordMultiGenerateDto, 'composition'>> & {
    variants?: DocVariant[];
};

/**
 * Запрос generate-multi с разделами по комплектам: у самого КП и у открытого
 * варианта. Способ печати (`complectsMode`) Word-запрос не несёт: Word-шаблоны
 * блока «по комплектам» пока не имеют. Поля потока продаж (`salesFlow`,
 * `presentation`) бэк принимает необязательными, в сгенерированном клиенте их
 * пока нет; после `pnpm run generate` расширение можно убрать.
 */
export type OfferMultiGenerateRequest = Omit<OfferWordMultiGenerateDto, 'variants'> &
    DocComplectsFields &
    OfferSalesFlowFields & { variants: DocVariant[] };

/**
 * Участники Word-КП: открытый вариант вместе с наполнением его наборов для
 * сравнения, когда Word его печатает (ALTERNATIVE_COMPLECTS_FORMATS). Наборы
 * берутся из участника: открытый вариант собран из живого состояния.
 */
const wordVariants = (state: RootState): DocVariant[] => {
    const { entries } = selectOfferVariantsPayload(state);
    const enabled = selectAlternativeComplectsEnabled(state);
    const catalog = selectCatalog(state);
    return entries.map(entry =>
        withAlternativeComplects(entry.doc, alternativeComplectsFields('word', enabled, catalog, entry.alternative)),
    );
};

/**
 * Вариант и настройки сделки для тела превью и PDF-КП. Участник (открытый
 * вариант) есть — `variants` и `composition` с режимом `compare` при любом
 * режиме сделки; участника нет — пустой объект, тело остаётся таким же, как до
 * вариантов. Пропущенного участника здесь нет: по нему документ блокируется
 * (offerBlocker).
 */
export const offerVariantsFields = (state: RootState): OfferVariantsFields => {
    const variants = wordVariants(state);
    return variants.length ? { variants, composition: selectOfferComposition(state) } : {};
};

/**
 * Одиночное тело КП в Word из состояния: шапка — offerDocument, содержание —
 * row-set через адаптер document-payload, адрес — app/portal. Нечего печатать
 * (см. offerBaseBlocker) — null. Варианты в это тело не входят: их добавляют
 * buildOfferMultiGenerateRequest и тело превью.
 */
export const buildOfferGenerateRequest = (state: RootState): OfferGenerateRequest | null => {
    if (offerBaseBlocker(state, 'word')) return null;
    const { domain, dealId, bitrix } = state.app;
    const template = state.offerTemplateWord.selectedTemplate;
    const provider = state.documentProvider.current;
    if (!dealId || !template || !provider) return null;

    // тип клиента из шапки; формирование без него заблокировано (offerGenerateBlocker)
    const clientType = toOfferClientType(selectClientType(state));

    const catalog = selectCatalog(state);
    const payload = buildOfferPayload({
        domain,
        dealId,
        companyId: Number(bitrix.company?.ID) || 0,
        userId: Number(bitrix.user?.ID) || 0,
        providerId: Number(provider.id) || 0,
        templateId: String(template.id),
        clientType,
        catalog,
        general: state.rowSet.general,
        alternative: state.rowSet.alternative,
        recipient: state.offerDocument.recipient,
        manager: managerFromBxUser(bitrix.user),
        // счёт с нормализацией: без наборов для сравнения «все товары» уходит false, оба «нет» — пустой счёт
        invoice: selectOfferRequestInvoice(state),
        isWord: true,
        // вне Битрикса очередь не нужна: ссылки сразу в ответе (легаси withoutQueue: !IS_PROD)
        withoutQueue: !IS_PROD,
    });
    if (!payload) return null;
    return {
        ...payload,
        ...alternativeComplectsFields('word', selectAlternativeComplectsEnabled(state), catalog, state.rowSet.alternative),
    };
};

/**
 * Запрос generate-multi: КП плюс открытый вариант и настройки сборки (режим
 * `compare` при любом режиме сделки). Открытого варианта нет — бэк печатает
 * одиночное КП (variants: []). Запрос формирования несёт поля потока продаж:
 * `salesFlow` у отдела продаж и `presentation` с выбранной презентацией.
 */
export const buildOfferMultiGenerateRequest = (state: RootState): OfferMultiGenerateRequest | null => {
    if (offerRequestBlocker(state)) return null;
    const offer = buildOfferGenerateRequest(state);
    if (!offer) return null;
    const variants = wordVariants(state);
    return {
        ...offer,
        variants,
        composition: variants.length ? selectOfferComposition(state) : undefined,
        ...selectOfferSalesFlowFields(state),
    };
};
