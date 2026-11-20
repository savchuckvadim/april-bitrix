import type { AiEnvelope } from '../model';

/** Конверт без готовых данных и без причины от сервера. */
export const AI_ENVELOPE_NOT_READY_TEXT =
    'Данные ещё не готовы — попробуйте ещё раз';

/**
 * Данные синхронной ручки из конверта: status = ready и data на месте.
 * Иначе — ошибка с текстом сервера (message) или запасным текстом; что из
 * этого показать человеку, решает `aiErrorMessage`.
 */
export const aiReadyData = <T>(envelope: AiEnvelope<T>): T => {
    if (envelope.status === 'ready' && envelope.data !== undefined) {
        return envelope.data;
    }
    throw new Error(envelope.message?.trim() || AI_ENVELOPE_NOT_READY_TEXT);
};
