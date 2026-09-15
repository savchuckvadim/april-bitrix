import {
    HowAnswer,
    HowProtocolAttachment,
    HowQuestionnaire,
    HowQuestionnaireQuestion,
    HowQuestionnaireState,
} from '../constants/types';

/** Отступ продолжения многострочного ответа и комментария в протоколе. */
const INDENT = '   ';

/** Раздел и страница в подписи протокола, если анкета их не задала. */
const DEFAULT_SOURCE_SECTION = 'Как мы работаем';
const DEFAULT_SOURCE_PAGE = 'Внедрение';

/** Пустой ответ подписывается по виду вопроса: у свободных полей нечего «выбирать». */
const emptyAnswerLabel = (question: HowQuestionnaireQuestion): string =>
    question.kind === 'text' || question.kind === 'link'
        ? 'НЕ ЗАПОЛНЕНО'
        : 'НЕ ВЫБРАНО';

/** Значение ответа одной строкой; многострочный текст уходит с отступом. */
const formatAnswerValue = (
    question: HowQuestionnaireQuestion,
    answer: HowAnswer,
): string => {
    const value =
        answer.custom?.trim() || answer.choice || emptyAnswerLabel(question);
    return value.replace(/\r?\n/g, `\n${INDENT}`);
};

/** Собирает человекочитаемый текстовый протокол по заполненной анкете. */
export const buildProtocol = (
    questionnaire: HowQuestionnaire,
    state: HowQuestionnaireState,
    attachments: HowProtocolAttachment[] = [],
): string => {
    const lines: string[] = [];
    lines.push(questionnaire.protocolTitle);
    lines.push(`Организация: ${state.company || '—'}`);
    lines.push(`Заполнил: ${state.respondent || '—'}`);
    lines.push(`Дата: ${new Date().toLocaleDateString('ru-RU')}`);
    lines.push('');

    let currentGroup: string | undefined;
    questionnaire.questions.forEach((question, index) => {
        if (question.group && question.group !== currentGroup) {
            if (currentGroup) lines.push('');
            currentGroup = question.group;
            lines.push(`== ${question.group} ==`);
        }
        const answer = state.answers[question.id] ?? {};
        lines.push(
            `${index + 1}. ${question.title}: ${formatAnswerValue(question, answer)}`,
        );
        if (answer.comment?.trim()) {
            lines.push(`${INDENT}Комментарий: ${answer.comment.trim()}`);
        }
    });

    if (attachments.length) {
        lines.push('');
        lines.push('Приложения — схемы клиента (PNG скачаны вместе с протоколом):');
        attachments.forEach((attachment, index) => {
            lines.push(
                `${index + 1}) ${attachment.fileName} — ${attachment.caption}`,
            );
        });
    }

    lines.push('');
    lines.push(
        `Сформировано на странице «${questionnaire.sourceSection ?? DEFAULT_SOURCE_SECTION} → ${questionnaire.sourcePage ?? DEFAULT_SOURCE_PAGE}».`,
    );
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

/** Скачивает dataURL (например, PNG-схему) как файл (client-only). */
export const downloadDataUrl = (fileName: string, dataUrl: string): void => {
    const anchor = document.createElement('a');
    anchor.href = dataUrl;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
};
