import {
    isSurveyTemplateOnly,
    surveyTemplateByCode,
} from '@workspace/event-sales-flow';

import {
    CheckPresentationFieldType,
    CheckPresentationItem,
    CheckPresentationValue,
} from '../type/check-presentation-type';

/**
 * Заполнен ли ответ по полю (с учётом типа поля).
 *
 * ШАБЛОН ВОПРОСОВ — НЕ ОТВЕТ. Поле открывается с пронумерованными
 * подвопросами внутри (переделка 01.09.2026), и они лежат в answers как
 * обычное значение. Без этой проверки обязательность блоков «Хвоста»
 * становилась бутафорией: менеджер жал «Сохранить», не написав ни слова,
 * валидатор видел непустую строку и пропускал, а в CRM не уезжало ничего —
 * там тот же шаблон отсекается. Отчёт выглядел заполненным, ответов не было.
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
        default: {
            if (typeof value !== 'string' || !value.trim()) return false;
            const template = surveyTemplateByCode(item.code);
            if (template && isSurveyTemplateOnly(value, template)) return false;
            return true;
        }
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
