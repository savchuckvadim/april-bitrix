import { OFFER_LETTER_TEXT } from '../consts/offer-letter.consts';
import {
    OFFER_LETTER_IMPORT_STATUS,
    OFFER_LETTER_SCOPE,
    type OfferLetter,
    type OfferLetterScopeFilter,
    type OfferLettersImportResponse,
} from '../model';

/** Итог запуска одной строкой */
export const offerLettersImportSummary = (result: OfferLettersImportResponse): string => {
    const total = result.items.length;
    if (!total) return 'Писем в легаси-шаблонах не найдено.';
    if (result.dryRun) {
        const planned = result.items.filter(
            item => item.status === OFFER_LETTER_IMPORT_STATUS.WOULD_CREATE,
        ).length;
        return `Проверка: найдено писем — ${total}, будет перенесено — ${planned}. Ничего не записано.`;
    }
    return `Перенос: найдено писем — ${total}, перенесено — ${result.created}.`;
};

export const yesNo = (value: boolean): string => (value ? 'Да' : 'Нет');

/** Письма под выбранный фильтр «чьи»; порядок остаётся серверным (`sort`) */
export const filterOfferLetters = (
    letters: readonly OfferLetter[],
    scope: OfferLetterScopeFilter,
): OfferLetter[] => {
    if (scope === OFFER_LETTER_SCOPE.PORTAL) {
        return letters.filter(letter => letter.bxUserId === null);
    }
    if (scope === OFFER_LETTER_SCOPE.PERSONAL) {
        return letters.filter(letter => letter.bxUserId !== null);
    }
    return [...letters];
};

/** Чьё письмо: «Портал» или имя менеджера; имени нет в списке сотрудников — его id */
export const offerLetterOwnerLabel = (
    letter: OfferLetter,
    managerNames: ReadonlyMap<number, string>,
    portalLabel: string,
): string => {
    if (letter.bxUserId === null) return portalLabel;
    return managerNames.get(letter.bxUserId) ?? `Менеджер id ${letter.bxUserId}`;
};

/** Почему переключатель «по умолчанию» недоступен; доступен — undefined */
export const offerLetterDefaultHint = (letter: OfferLetter): string | undefined => {
    if (letter.isDefault) return OFFER_LETTER_TEXT.defaultHint;
    if (!letter.isActive) return OFFER_LETTER_TEXT.inactiveHint;
    return undefined;
};

export const formatOfferLetterDate =(value: string | null): string =>
    value ? new Date(value).toLocaleString('ru-RU') : '—';

/** Счётчик длины текста под полем */
export const offerLetterLengthLabel = (length: number, max: number): string =>
    `${length} из ${max}`;
