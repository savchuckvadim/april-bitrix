import {
    OFFER_LETTER_NAME_MAX_LENGTH,
    OFFER_LETTER_SORT_MAX,
    OFFER_LETTER_TEXT_MAX_LENGTH,
} from '../consts/offer-letter.consts';
import type {
    OfferLetter,
    OfferLetterCreate,
    OfferLetterFormErrors,
    OfferLetterFormValues,
    OfferLetterUpdate,
} from '../model';
import { normalizeLetterText } from './markup/offer-letter-markup.util';
import { findLetterMarkupError } from './markup/offer-letter-validation.util';

/** Значения формы нового письма: письмо портала, активное, без письма по умолчанию */
export const emptyOfferLetterForm = (): OfferLetterFormValues => ({
    name: '',
    text: '',
    isPersonal: false,
    bxUserId: 0,
    isActive: true,
    isDefault: false,
    sort: '0',
});

/** Значения формы существующего письма; текст приводится к обычным переводам строк */
export const offerLetterToForm = (letter: OfferLetter): OfferLetterFormValues => ({
    name: letter.name,
    text: normalizeLetterText(letter.text),
    isPersonal: letter.bxUserId !== null,
    bxUserId: letter.bxUserId ?? 0,
    isActive: letter.isActive,
    isDefault: letter.isDefault,
    sort: String(letter.sort),
});

/** Порядок из поля ввода: пусто — 0; не целое или за пределами — null */
export const parseOfferLetterSort = (value: string): number | null => {
    const trimmed = value.trim();
    if (!trimmed) return 0;
    const sort = Number(trimmed);
    return Number.isInteger(sort) && sort >= 0 && sort <= OFFER_LETTER_SORT_MAX
        ? sort
        : null;
};

/** Ошибки формы по полям; пустой объект — форму можно отправлять */
export const validateOfferLetterForm = (
    values: OfferLetterFormValues,
): OfferLetterFormErrors => {
    const errors: OfferLetterFormErrors = {};
    const name = values.name.trim();
    const text = values.text.trim();

    if (!name) errors.name = 'Введите название письма.';
    else if (name.length > OFFER_LETTER_NAME_MAX_LENGTH) {
        errors.name = `Название длиннее ${OFFER_LETTER_NAME_MAX_LENGTH} знаков.`;
    }

    if (!text) errors.text = 'Введите текст письма.';
    else if (text.length > OFFER_LETTER_TEXT_MAX_LENGTH) {
        errors.text = `Текст длиннее ${OFFER_LETTER_TEXT_MAX_LENGTH} знаков.`;
    } else {
        const markupError = findLetterMarkupError(text);
        if (markupError) errors.text = markupError;
    }

    if (values.isPersonal && values.bxUserId <= 0) {
        errors.bxUserId = 'Выберите менеджера.';
    }
    if (parseOfferLetterSort(values.sort) === null) {
        errors.sort = `Порядок — целое число от 0 до ${OFFER_LETTER_SORT_MAX}.`;
    }
    return errors;
};

export const toOfferLetterCreate = (
    portalId: number,
    values: OfferLetterFormValues,
): OfferLetterCreate => ({
    portalId,
    bxUserId: values.isPersonal ? values.bxUserId : null,
    name: values.name.trim(),
    text: values.text.trim(),
    isActive: values.isActive,
    isDefault: values.isDefault,
    sort: parseOfferLetterSort(values.sort) ?? 0,
});

/** Правка: область и «по умолчанию» не уходят, для них свои действия */
export const toOfferLetterUpdate = (values: OfferLetterFormValues): OfferLetterUpdate => ({
    name: values.name.trim(),
    text: values.text.trim(),
    isActive: values.isActive,
    sort: parseOfferLetterSort(values.sort) ?? 0,
});
