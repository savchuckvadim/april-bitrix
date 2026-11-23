import type { ComplectCompositionDto } from '@workspace/nest-konstructor-api';
import type { RootState } from '@/modules/app/model/store';
import { selectOfferComposition } from '../../complect-variant';
import { selectOfferVariantsPayload } from '../../offer-document';
import type { OfferComplectsMode, OfferPdfVariant } from '../model/types';

/** Участник PDF-КП (открытый вариант) и настройки сделки; участника нет — поля не передаются. */
export interface OfferPdfVariantsFields {
    variants?: OfferPdfVariant[];
    composition?: ComplectCompositionDto;
}

/**
 * Вариант и настройки сделки для тела превью и PDF-КП. КП идёт по открытому
 * варианту при любом режиме сделки, поэтому настройки уходят с режимом
 * `compare`. Способ печати наполнения вариант берёт из живых настроек экрана
 * (`liveMode`). Открытого варианта нет — пустой объект.
 */
export const offerPdfVariantsFields = (state: RootState, liveMode: OfferComplectsMode): OfferPdfVariantsFields => {
    const { entries } = selectOfferVariantsPayload(state);
    if (!entries.length) return {};
    return {
        variants: entries.map(entry => ({
            ...entry.doc,
            complectsMode: liveMode,
        })),
        composition: selectOfferComposition(state),
    };
};
