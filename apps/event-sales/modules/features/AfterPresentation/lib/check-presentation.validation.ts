import {
    CheckPresentationFieldType,
    CheckPresentationItem,
    CheckPresentationValue,
} from '../type/check-presentation-type';

/**
 * Заполнен ли ответ по полю (с учётом типа поля).
 *
 * Для блока с подвопросами значение — уже собранная строка
 * (`composeSurveyBlockValue`): она непуста ровно тогда, когда менеджер
 * написал хоть что-то в строке Вопроса или ответил хоть на один
 * подвопрос — это и есть обязательность родителя (02.09). Шаблон вопросов
 * в значение больше не сеется, поэтому «непусто» снова значит «отвечено».
 */
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
        .filter(
            item => item.required && !isAnswerFilled(item, answers[item.id]),
        )
        .map(item => item.id);
