/**
 * Якоря страницы схемы.
 *
 * Одно место на весь раздел: теория ссылается сюда, схема этими же значениями
 * подписывает узлы. Разъедутся — кнопка «Посмотреть на схеме» будет уводить в
 * никуда, а это ровно та поломка, которую никто не заметит глазами.
 */

export const DIALS_ANCHOR = 'dials';

export const questionAnchorId = (questionId: string): string =>
    `q-${questionId}`;

/**
 * Куда вести читателя из врезки «Дискурс».
 *
 * Если развилка меняет ответ — ведём к самому вопросу; если только ползунки —
 * к ползункам. Первый ответ выбран намеренно: он и есть предмет спора.
 */
export const discourseAnchor = (
    answers: Record<string, string> | undefined,
): string => {
    const first = Object.keys(answers ?? {})[0];
    return first ? questionAnchorId(first) : DIALS_ANCHOR;
};
