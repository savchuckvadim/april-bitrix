import { format } from 'date-fns';
import {
    CheckPresentationFieldType,
    CheckPresentationItem,
    CheckPresentationValue,
} from '../type/check-presentation-type';
import { isAnswerFilled } from './check-presentation.validation';

/** Человекочитаемое значение ответа по полю (с учётом типа). */
const formatValue = (
    item: CheckPresentationItem,
    value: CheckPresentationValue,
): string => {
    switch (item.type) {
        case CheckPresentationFieldType.BOOLEAN:
            return value ? 'Да' : 'Нет';

        case CheckPresentationFieldType.DATE: {
            const raw = String(value);
            const date = new Date(raw);
            return isNaN(date.getTime()) ? raw : format(date, 'dd.MM.yyyy');
        }

        case CheckPresentationFieldType.ENUMERATION: {
            const options = item.options || [];
            const codes = Array.isArray(value) ? value : [String(value)];
            return codes
                .map(code => options.find(o => o.code === code)?.title ?? code)
                .join(', ');
        }

        case CheckPresentationFieldType.STRING:
        default:
            return String(value);
    }
};

/**
 * Текст хвоста: «Заголовок: значение» по строкам, по порядку order,
 * только заполненные поля. Используется и в UI, и при отправке события.
 */
export const buildCheckPresentationComment = (
    items: CheckPresentationItem[],
    answers: Record<string, CheckPresentationValue>,
): string =>
    [...items]
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .filter(item => isAnswerFilled(item, answers[item.id]))
        .map(item => `${item.title}: ${formatValue(item, answers[item.id]!)}`)
        .join('\n');
