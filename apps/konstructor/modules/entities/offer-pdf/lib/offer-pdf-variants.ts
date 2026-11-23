import type { ComplectCompositionDto } from '@workspace/nest-konstructor-api';
import type { RootState } from '@/modules/app/model/store';
import { selectCatalog } from '../../catalog';
import { selectOfferComposition } from '../../complect-variant';
import {
    alternativeComplectsFields,
    selectOfferVariantsPayload,
    withAlternativeComplects,
} from '../../offer-document';
import type { OfferPdfSettings, OfferPdfVariant } from '../model/types';

/** Участник PDF-КП (открытый вариант) и настройки сделки; участника нет — поля не передаются. */
export interface OfferPdfVariantsFields {
    variants?: OfferPdfVariant[];
    composition?: ComplectCompositionDto;
}

/**
 * Вариант и настройки сделки для тела превью и PDF-КП. КП идёт по открытому
 * варианту при любом режиме сделки, поэтому настройки уходят с режимом
 * `compare`. Способ печати наполнения и показ наполнения наборов для сравнения
 * вариант берёт из живых настроек экрана (`settings`); наборы для сравнения —
 * его собственные, то есть живые наборы сделки, из которых собран открытый
 * вариант. Открытого варианта нет — пустой объект.
 */
export const offerPdfVariantsFields = (
    state: RootState,
    settings: Pick<OfferPdfSettings, 'complectsMode' | 'alternativeComplects'>,
): OfferPdfVariantsFields => {
    const { entries } = selectOfferVariantsPayload(state);
    if (!entries.length) return {};
    const catalog = selectCatalog(state);
    return {
        variants: entries.map(entry => ({
            ...withAlternativeComplects(
                entry.doc,
                alternativeComplectsFields('pdf', settings.alternativeComplects, catalog, entry.alternative),
            ),
            complectsMode: settings.complectsMode,
        })),
        composition: selectOfferComposition(state),
    };
};
