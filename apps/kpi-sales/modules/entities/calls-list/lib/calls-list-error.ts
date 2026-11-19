/**
 * Ошибка загрузки списка разборов → что показать: 403 — «раздел доступен
 * руководителям» (текст сервера), остальное — понятный текст сервера или
 * запасной текст и «Повторить».
 */
import {
    aiErrorMessage,
    aiErrorStatus,
    aiServerMessage,
    isAiTechnicalErrorText,
} from '@/modules/entities/ai-analytics/lib/ai-error.util';
import type { CallsListError } from '../model/types';
import { CALLS_LIST_TEXT } from './calls-list.texts';

const HTTP_FORBIDDEN = 403;

export function callsListErrorOf(error: unknown): CallsListError {
    if (aiErrorStatus(error) === HTTP_FORBIDDEN) {
        const server = aiServerMessage(error);
        return {
            kind: 'forbidden',
            message:
                server && !isAiTechnicalErrorText(server)
                    ? server
                    : CALLS_LIST_TEXT.states.forbiddenTitle,
        };
    }
    return {
        kind: 'error',
        message: aiErrorMessage(error, CALLS_LIST_TEXT.states.errorFallback),
    };
}
