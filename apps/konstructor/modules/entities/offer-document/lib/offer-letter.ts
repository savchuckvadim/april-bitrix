import type { RootState } from '@/modules/app/model/store';
import type { OfferLetterFields } from '../model/types';

/**
 * Сопроводительное письмо в КП из состояния. Флаг хранят настройки PDF-КП
 * (`offerPdf.prefs.settings`): слепок сделки, браузер и избранное запоминают
 * его вместе с остальными, а Word-запрос читает тот же флаг.
 */
export const selectOfferWithLetter = (state: Pick<RootState, 'offerPdf'>): boolean =>
    state.offerPdf.prefs.settings.withLetter;

/**
 * Поле `withLetter` Word-запроса. Письмо включено — поля нет и запрос тот же,
 * что был до флага; выключено — `withLetter: false`.
 */
export const offerLetterFields = (withLetter: boolean): OfferLetterFields => (withLetter ? {} : { withLetter: false });
