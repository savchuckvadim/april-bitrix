import type { ComplectCompositionDto } from '@workspace/nest-konstructor-api';
import type { RootState } from '@/modules/app/model/store';
import { selectComposition } from '../../complect-variant';
import { selectVariantsPayload } from '../../offer-document';
import type { OfferComplectsMode, OfferPdfVariant } from '../model/types';
import { offerPdfComplectsModeOf } from './offer-pdf-storage';

/** Участники PDF-КП и настройки сделки; участников нет — поля не передаются. */
export interface OfferPdfVariantsFields {
    variants?: OfferPdfVariant[];
    composition?: ComplectCompositionDto;
}

/**
 * Варианты и настройки сделки для тела превью и PDF-КП. У каждого участника
 * свой способ печати наполнения: открытый вариант берёт его из живых
 * настроек экрана (`liveMode`), остальные из `pdf` своего слепка; слепок без
 * этого поля даёт объединённое наполнение. Участников нет — пустой объект.
 */
export const offerPdfVariantsFields = (state: RootState, liveMode: OfferComplectsMode): OfferPdfVariantsFields => {
    const { entries } = selectVariantsPayload(state);
    if (!entries.length) return {};
    return {
        variants: entries.map(entry => ({
            ...entry.doc,
            complectsMode: entry.isOpen ? liveMode : offerPdfComplectsModeOf(entry.pdf),
        })),
        composition: selectComposition(state),
    };
};
