import type { RootState } from '@/modules/app/model/store';
import { buildOfferGenerateRequest, offerRequestBlocker, offerVariantsFields } from '../../offer-document';
import type { OfferWordPreviewRequest } from '../model/preview-request';

/**
 * Тело превью PDF по Word-шаблону: тело формирования КП плюс участники-варианты
 * и настройки сделки, когда участники есть. Нечего печатать или участника
 * собрать нельзя (тот же блокер, что у формирования) — null: ложного превью
 * без пропущенного варианта быть не должно.
 */
export const buildWordPreviewRequest = (state: RootState): OfferWordPreviewRequest | null => {
    if (offerRequestBlocker(state)) return null;
    const offer = buildOfferGenerateRequest(state);
    return offer ? { ...offer, ...offerVariantsFields(state) } : null;
};
