/**
 * Блок опросника «5К/Хвост»: Вопрос с подвопросами (переделка 02.09.2026).
 *
 * Менеджер отвечает либо одним текстом на весь Вопрос, либо — развернув
 * блок — по каждому подвопросу отдельно. В CRM у блока ОДНО строковое
 * поле, поэтому ответы собираются в его значение здесь, и только здесь:
 * persist, payload и сводка «5К» читают уже собранную строку.
 */

export interface SurveyBlockDraft {
    /** Собственный текст Вопроса — свёрнутый режим или общий ответ. */
    text: string;
    /** Ответы по подвопросам, ключ — индекс подвопроса в блоке. */
    sub: Record<number, string>;
    /** Блок развёрнут «подробно»: подвопросы — отдельными полями. */
    expanded: boolean;
}

export const EMPTY_SURVEY_BLOCK: SurveyBlockDraft = {
    text: '',
    sub: {},
    expanded: false,
};

/** Ответов на подвопросы — для бейджа в свёрнутом виде. */
export const countAnsweredSub = (draft: SurveyBlockDraft): number =>
    Object.values(draft.sub).filter(answer => answer.trim()).length;

/**
 * Обязательность — на РОДИТЕЛЕ: хоть один подвопрос или хоть что-то в
 * строке Вопроса (решение владельца 02.09).
 */
export const isSurveyBlockAnswered = (draft: SurveyBlockDraft): boolean =>
    Boolean(draft.text.trim()) || countAnsweredSub(draft) > 0;

/**
 * Значение поля CRM из черновика блока.
 *
 * Нет ответов на подвопросы — записывается ровно то, что набрал менеджер
 * («собранный режим — как одно поле»). Есть — построчно: собственный текст
 * первой строкой, затем только отвеченные подвопросы в виде
 * «N. Подвопрос — ответ», где N — номер подвопроса в блоке, а не порядковый
 * номер ответа: читающему карточку важно, на что именно ответили.
 *
 * Свёрнутость на значение не влияет: подответы, набранные до сворачивания,
 * менеджер записал — они остаются в поле.
 */
export const composeSurveyBlockValue = (
    questions: readonly string[],
    draft: SurveyBlockDraft,
): string => {
    const own = draft.text.trim();
    const answered = questions
        .map((question, index) => ({
            question,
            index,
            answer: (draft.sub[index] ?? '').trim(),
        }))
        .filter(entry => entry.answer);

    if (!answered.length) return own;

    return [
        own,
        ...answered.map(
            entry => `${entry.index + 1}. ${entry.question} — ${entry.answer}`,
        ),
    ]
        .filter(Boolean)
        .join('\n');
};
