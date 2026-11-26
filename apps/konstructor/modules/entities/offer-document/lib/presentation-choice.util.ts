import type { OfferPresentationFields, OfferPresentationState, PresentationDeal } from '../model/types';

/** Почему КП не формируется: ответили «Да», а презентацию из нескольких не выбрали. */
export const PRESENTATION_REQUIRED_BLOCKER = 'Выберите презентацию, после которой отправляется КП';

/** Вопрос «Документы в продолжение презентации?» виден, только когда у сделки есть презентации. */
export const isPresentationQuestionVisible = (presentation: Pick<OfferPresentationState, 'items'>): boolean =>
    presentation.items.length > 0;

/**
 * Ответ «Да» с учётом видимости вопроса: ответ остаётся в состоянии, но без
 * презентаций он не действует.
 */
export const isPresentationAnswered = (presentation: Pick<OfferPresentationState, 'items' | 'answer'>): boolean =>
    presentation.answer && isPresentationQuestionVisible(presentation);

/**
 * Презентация, после которой отправляется КП. «Да» и одна презентация —
 * она сама; несколько — только та, что выбрана явно (выбора по умолчанию нет);
 * «Нет» или вопроса нет — null.
 */
export const selectedPresentation = (
    presentation: Pick<OfferPresentationState, 'items' | 'answer' | 'dealId'>,
): PresentationDeal | null => {
    if (!isPresentationAnswered(presentation)) return null;
    if (presentation.items.length === 1) return presentation.items[0] ?? null;
    return presentation.items.find(item => item.id === presentation.dealId) ?? null;
};

/** Блокер формирования КП: «Да» при нескольких презентациях без выбора; иначе null. */
export const presentationBlocker = (
    presentation: Pick<OfferPresentationState, 'items' | 'answer' | 'dealId'>,
): string | null =>
    isPresentationAnswered(presentation) && !selectedPresentation(presentation) ? PRESENTATION_REQUIRED_BLOCKER : null;

/**
 * Поле `presentation` запроса КП: только с `dealId` выбранной презентации.
 * Объект без `dealId` не отправляется никогда: «Нет», нет презентаций и
 * невыбранная презентация дают пустой набор полей.
 */
export const presentationRequestFields = (
    presentation: Pick<OfferPresentationState, 'items' | 'answer' | 'dealId'>,
): OfferPresentationFields => {
    const selected = selectedPresentation(presentation);
    return selected ? { presentation: { dealId: selected.id } } : {};
};

/** Строка «Презентация» в сводке «Сборки»: что известно о ответе. */
export interface PresentationSummaryInput {
    /** Название выбранной презентации; null — ответили «Да», презентацию ещё не выбрали */
    title: string | null;
}

/** Сводка по ответу: null — ответ «Нет» или вопроса нет (строки в сводке не будет). */
export const presentationSummary = (
    presentation: Pick<OfferPresentationState, 'items' | 'answer' | 'dealId'>,
): PresentationSummaryInput | null =>
    isPresentationAnswered(presentation) ? { title: selectedPresentation(presentation)?.title ?? null } : null;
