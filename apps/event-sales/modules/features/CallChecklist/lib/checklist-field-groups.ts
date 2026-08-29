import type { ChecklistFieldView } from './checklist-field-view';

/**
 * Разбивка вопросов анкеты на секции по `groupTitle`.
 *
 * Группу задаёт КАТАЛОГ, а не код поля. В опроснике после презентации
 * категория до сих пор выводится из префикса кода (`op_5k_client_*` →
 * «Клиент»): это работает ровно до первого поля, заведённого на портале
 * руками, — угадывать смысл по имени переменной анкета не обязана.
 *
 * Секции идут ПОДРЯД в порядке показа вопросов (`sort`, при равенстве —
 * код; сортирует `checklistFieldRefs`). Заголовок ставится там, где
 * `groupTitle` сменился: порядок задаёт админ анкеты, и группировать за него
 * (собирая разбросанные вопросы в одну секцию) значило бы молча
 * переставлять вопросы местами.
 */
export interface ChecklistFieldGroupView {
    /** Заголовок секции; null — вопросы без группы (полосы не будет). */
    title: string | null;
    fields: ChecklistFieldView[];
}

export const groupChecklistFields = (
    fields: ChecklistFieldView[],
): ChecklistFieldGroupView[] => {
    const groups: ChecklistFieldGroupView[] = [];
    for (const field of fields) {
        const title = field.def.groupTitle ?? null;
        const last = groups[groups.length - 1];
        if (last && last.title === title) {
            last.fields.push(field);
            continue;
        }
        groups.push({ title, fields: [field] });
    }
    return groups;
};
