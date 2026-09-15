import type { RootState } from '@/modules/app/model/store';
import { selectEffectiveUser } from '@/modules/app/model/selectors';
import {
    AiAnalyticsHelper,
    type AiRequester,
} from '../lib/api/ai-analytics-helper';

/* Общее для sync- и queued-thunks: клиент, тайминги, requester, ошибки. */

/** Единственный экземпляр клиента ручек AI-аналитики на оба набора thunks. */
export const aiHelper = new AiAnalyticsHelper();

/** queued/processing синхронных ручек: перепрашиваем с этим шагом… */
export const AI_POLL_INTERVAL_MS = 5_000;
/** …и не дольше этого — дальше секция уходит в ошибку с подсказкой. */
export const AI_QUEUED_TIMEOUT_MS = 90_000;
/**
 * Тяжёлые ручки: если WS done не пришёл за 90 с — повторяем POST по тому
 * же requestKey; после стольких повторов подряд сдаёмся с ошибкой.
 */
export const AI_QUEUED_MAX_ATTEMPTS = 3;

export const AI_TIMEOUT_MESSAGE =
    'Расчёт занял слишком долго. Нажмите «Повторить».';

export const aiErrorMessage = (error: unknown, fallback: string): string =>
    error instanceof Error && error.message ? error.message : fallback;

/** Кто спрашивает; null — публичная /share или приложение не инициализировано. */
export const selectAiRequester = (state: RootState): AiRequester | null => {
    const user = selectEffectiveUser(state);
    const domain = state.app.domain;
    if (!domain || state.app.isPublic || !user?.ID) return null;
    return { domain, requesterUserId: String(user.ID) };
};
