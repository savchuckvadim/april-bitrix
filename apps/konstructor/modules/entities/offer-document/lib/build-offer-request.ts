import type { OfferWordMultiGenerateDto } from '@workspace/nest-konstructor-api';
import type { RootState } from '@/modules/app/model/store';
import { IS_PROD } from '@/modules/app/consts/app-global';
import { selectCatalog } from '../../catalog';
import { selectComposition, selectVariantStageOf } from '../../complect-variant';
import { getDealClientType } from '../../deal';
import { buildOfferPayload, type OfferGenerateRequest } from '../../document-payload';
import { findMainRow } from '../../row-set';
import { toOfferClientType } from './client-type.util';
import { managerFromBxUser } from './manager.util';
import { buildVariantsPayload } from './build-variants-payload';

/** Почему КП сейчас не собрать — подпись к заблокированной кнопке; null — можно. */
export const offerRequestBlocker = (state: RootState): string | null => {
    if (!state.app.domain) return 'Приложение не инициализировано';
    if (!state.app.dealId) return 'Сначала сохраните сделку — КП прикрепляется к ней';
    if (!findMainRow(state.rowSet.general)) return 'Нет главной строки: соберите комплект';
    if (!state.offerTemplateWord.selectedTemplate) return 'Выберите шаблон КП';
    if (!state.documentProvider.current) return 'Выберите поставщика';
    return null;
};

/**
 * Запрос КП (generate / превью PDF) из состояния: шапка — offerDocument,
 * содержание — row-set через адаптер document-payload, адрес — app/portal.
 * Нечего печатать (см. offerRequestBlocker) — null.
 */
export const buildOfferGenerateRequest = (state: RootState): OfferGenerateRequest | null => {
    if (offerRequestBlocker(state)) return null;
    const { domain, dealId, bitrix } = state.app;
    const template = state.offerTemplateWord.selectedTemplate;
    const provider = state.documentProvider.current;
    if (!dealId || !template || !provider) return null;

    const clientType = toOfferClientType(
        getDealClientType(state.portal.current?.bitrixDeal ?? undefined, bitrix.deal ?? undefined),
    );

    return buildOfferPayload({
        domain,
        dealId,
        companyId: Number(bitrix.company?.ID) || 0,
        userId: Number(bitrix.user?.ID) || 0,
        providerId: Number(provider.id) || 0,
        templateId: String(template.id),
        clientType,
        catalog: selectCatalog(state),
        general: state.rowSet.general,
        alternative: state.rowSet.alternative,
        recipient: state.offerDocument.recipient,
        manager: managerFromBxUser(bitrix.user),
        invoice: state.offerDocument.invoice,
        isWord: true,
        // вне Битрикса очередь не нужна: ссылки сразу в ответе (легаси withoutQueue: !IS_PROD)
        withoutQueue: !IS_PROD,
    });
};

/**
 * Запрос generate-multi: КП плюс участники-варианты и настройки сборки.
 * Вариантов нет — бэк печатает одиночное КП (variants: []).
 */
export const buildOfferMultiGenerateRequest = (state: RootState): OfferWordMultiGenerateDto | null => {
    const offer = buildOfferGenerateRequest(state);
    if (!offer) return null;
    const { records, items, openVariantSmartId } = state.complectVariant;
    const variants = buildVariantsPayload({
        catalog: selectCatalog(state),
        records,
        items,
        stageOf: selectVariantStageOf(state),
        openVariantSmartId,
        live: { general: state.rowSet.general, alternative: state.rowSet.alternative },
    });
    return {
        ...offer,
        variants,
        composition: variants.length ? selectComposition(state) : undefined,
    };
};
