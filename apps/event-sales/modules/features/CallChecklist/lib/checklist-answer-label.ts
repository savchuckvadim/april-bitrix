import type { ChecklistFieldDef } from '../type/call-checklist.type';
import { checklistBooleanTitle } from './checklist-boolean';
import {
    findChecklistOptionByCode,
    hasChecklistChoice,
    toChecklistDisplayValue,
} from './checklist-values';

/**
 * Человекочитаемый ответ: то, что прочитает человек, а не то, чем ответ
 * хранится.
 *
 * Значение ответа — всегда КОД (вариант справочника, `Y`/`N`, ISO-дата
 * контрола): по нему сходятся контрол, запись в портал и сборка payload.
 * В текст (комментарий события) такой код пускать нельзя — читающий отчёт
 * руководитель увидел бы `pay_now` и `2026-09-01` вместо «Оплатит сейчас»
 * и «01.09.2026».
 */
export const checklistAnswerLabel = (
    def: ChecklistFieldDef,
    value: string,
): string => {
    if (!value) return '';
    if (def.control === 'boolean') return checklistBooleanTitle(value) || value;
    if (def.control === 'enumeration' || hasChecklistChoice(def)) {
        return findChecklistOptionByCode(def.options, value)?.title ?? value;
    }
    if (def.control === 'date' || def.control === 'datetime') {
        return toChecklistDisplayValue(def.control, value) || value;
    }
    return value;
};
