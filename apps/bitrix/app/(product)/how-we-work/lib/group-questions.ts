import { HowQuestionnaireQuestion } from '../constants/types';

/** Вопрос вместе со сквозным номером в анкете (нумерация не сбрасывается по разделам). */
export interface HowNumberedQuestion {
    question: HowQuestionnaireQuestion;
    index: number;
}

/** Разделы анкеты; у анкет без `group` — один безымянный раздел. */
export interface HowQuestionGroup {
    title?: string;
    items: HowNumberedQuestion[];
}

/** Режет список вопросов на разделы по смене `group`, сохраняя порядок. */
export const groupQuestions = (
    questions: HowQuestionnaireQuestion[],
): HowQuestionGroup[] => {
    const groups: HowQuestionGroup[] = [];
    let current: HowQuestionGroup | undefined;
    questions.forEach((question, index) => {
        if (!current || current.title !== question.group) {
            current = { title: question.group, items: [] };
            groups.push(current);
        }
        current.items.push({ question, index });
    });
    return groups;
};
