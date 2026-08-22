import { format } from 'date-fns';
import {
    CheckPresentationFieldType,
    CheckPresentationItem,
    CheckPresentationValue,
} from '../type/check-presentation-type';
import { isAnswerFilled } from './check-presentation.validation';
import {
    getDisplayTitle,
    getFiveKGroup,
    isFiveKCode,
} from './check-presentation.groups';

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

/**
 * Структурный текст для КОММЕНТАРИЯ события/таймлайна: плоские 20 строк
 * читались стеной. Блок «Хвост презентации» (разговор), пустая строка,
 * блок «Пять К» с подзаголовками категорий — префикс из строк вопросов
 * срезан, его несёт подзаголовок. Поля Битрикса это НЕ трогает: сводка
 * op_presentation_5k собирается persist-билдером с полными заголовками.
 */
export const buildCheckPresentationCommentPretty = (
    items: CheckPresentationItem[],
    answers: Record<string, CheckPresentationValue>,
): string => {
    const filled = [...items]
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .filter(item => isAnswerFilled(item, answers[item.id]));

    const talk = filled.filter(item => !isFiveKCode(item.code));
    const fiveK = filled.filter(item => isFiveKCode(item.code));

    const parts: string[] = [];

    if (talk.length) {
        parts.push(
            [
                '— Хвост презентации —',
                ...talk.map(
                    item =>
                        `${item.title}: ${formatValue(item, answers[item.id]!)}`,
                ),
            ].join('\n'),
        );
    }

    if (fiveK.length) {
        const lines: string[] = ['— Пять К —'];
        let prevGroup: string | null = null;
        for (const item of fiveK) {
            const group = getFiveKGroup(item.code);
            if (group && group !== prevGroup) {
                lines.push(`${group}:`);
                prevGroup = group;
            }
            lines.push(
                `· ${getDisplayTitle(item)}: ${formatValue(item, answers[item.id]!)}`,
            );
        }
        parts.push(lines.join('\n'));
    }

    return parts.join('\n\n');
};
