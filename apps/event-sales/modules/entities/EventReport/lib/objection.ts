/**
 * Справочник возражений `op_objection_reason` — общие правила для всех мест,
 * где его спрашивают (чек-листы, опросник после презентации).
 */

/**
 * «Нет возражений» — явный ответ, а не пустота (02.09). Отличает «спросили,
 * возражений нет» от «не спрашивали», закрывает обязательность вопроса и
 * исключает остальные пункты: возражений либо нет, либо они есть.
 */
export const OBJECTION_NONE_CODE = 'op_objection_none';

/**
 * Переключение пункта в множественном выборе возражений с учётом
 * исключающего «Нет возражений».
 */
export const toggleObjection = (
    selected: readonly string[],
    code: string,
): string[] => {
    if (selected.includes(code)) {
        return selected.filter(item => item !== code);
    }
    if (code === OBJECTION_NONE_CODE) return [code];
    return [...selected.filter(item => item !== OBJECTION_NONE_CODE), code];
};
