import {
    HowQuestionnaire,
    HowQuestionnaireState,
} from '../constants/types';

/** Собирает человекочитаемый текстовый протокол по заполненной анкете. */
export const buildProtocol = (
    questionnaire: HowQuestionnaire,
    state: HowQuestionnaireState,
): string => {
    const lines: string[] = [];
    lines.push(questionnaire.protocolTitle);
    lines.push(`Организация: ${state.company || '—'}`);
    lines.push(`Заполнил: ${state.respondent || '—'}`);
    lines.push(`Дата: ${new Date().toLocaleDateString('ru-RU')}`);
    lines.push('');

    questionnaire.questions.forEach((question, index) => {
        const answer = state.answers[question.id] ?? {};
        const value =
            answer.custom?.trim() || answer.choice || 'НЕ ВЫБРАНО';
        lines.push(`${index + 1}. ${question.title}: ${value}`);
        if (answer.comment?.trim()) {
            lines.push(`   Комментарий: ${answer.comment.trim()}`);
        }
    });

    lines.push('');
    lines.push('Сформировано на странице «Как мы работаем → Внедрение».');
    return lines.join('\n');
};

/** Скачивает текст как файл (client-only). */
export const downloadText = (fileName: string, text: string): void => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
};
