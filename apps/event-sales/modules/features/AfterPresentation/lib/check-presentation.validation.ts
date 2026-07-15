import {
    CheckPresentationFieldType,
    CheckPresentationItem,
    CheckPresentationValue,
} from '../type/check-presentation-type';

/** Заполнен ли ответ по полю (с учётом типа поля). */
export const isAnswerFilled = (
    item: CheckPresentationItem,
    value: CheckPresentationValue | undefined,
): boolean => {
    switch (item.type) {
        case CheckPresentationFieldType.BOOLEAN:
            return value === true || value === false;

        case CheckPresentationFieldType.ENUMERATION:
            if (item.isMultiple) {
                return Array.isArray(value) && value.length > 0;
            }
            return typeof value === 'string' && value.length > 0;

        case CheckPresentationFieldType.DATE:
        case CheckPresentationFieldType.STRING:
        default:
            return typeof value === 'string' && value.trim().length > 0;
    }
};

/** id обязательных полей, которые ещё не заполнены. */
export const getMissingRequiredIds = (
    items: CheckPresentationItem[],
    answers: Record<string, CheckPresentationValue>,
): string[] =>
    items
        .filter(item => item.required && !isAnswerFilled(item, answers[item.id]))
        .map(item => item.id);
