import type { RopReviewPayload } from './rop-review-submission';

/**
 * Базовый адрес бэка `kpi-sales` для server-side вызовов. Переопределяется
 * переменной `KPI_SALES_API_URL` (со слэшем на конце или без — приводим).
 */
export const KPI_SALES_API_URL_DEFAULT = 'https://api.kpi-sales.april-app.ru/';

/** Ручка приёма отзыва руководителя на бэке, относительно базового адреса. */
export const ROP_REVIEW_BACKEND_PATH = 'api/ai-analytics/review';

/** Сколько ждём бэк, прежде чем предложить повторить. */
export const ROP_REVIEW_TIMEOUT_MS = 10_000;

/** Тексты ошибок двери, когда бэк своего текста не дал. */
export const ROP_REVIEW_SEND_ERROR = {
    tooMany: 'Слишком много отправок, подождите',
    unavailable: 'Не удалось передать отзыв — попробуйте ещё раз',
    rejected: 'Отзыв не принят — проверьте ссылку и попробуйте ещё раз',
} as const;

/** Итог передачи: `status` — какой код отдать клиенту сайта. */
export type RopReviewSendResult =
    | { ok: true }
    | { ok: false; status: 400 | 429 | 502; error: string };

/** Конверт ответа бэка: `resultCode` 0 — принято, 1 — отклонено с текстом. */
interface BackendEnvelope {
    resultCode?: number;
    message?: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null;

/** Адрес ручки: базовый адрес из окружения или по умолчанию, плюс путь. */
export const ropReviewBackendUrl = (): string => {
    const base = process.env.KPI_SALES_API_URL || KPI_SALES_API_URL_DEFAULT;
    return `${base.endsWith('/') ? base : `${base}/`}${ROP_REVIEW_BACKEND_PATH}`;
};

/** Читает конверт; тело не JSON или не конверт — пустой конверт. */
const readEnvelope = async (response: Response): Promise<BackendEnvelope> => {
    try {
        const body: unknown = await response.json();
        if (!isRecord(body)) return {};
        return {
            resultCode:
                typeof body.resultCode === 'number'
                    ? body.resultCode
                    : undefined,
            message:
                typeof body.message === 'string' ? body.message : undefined,
        };
    } catch {
        return {};
    }
};

/**
 * Передаёт отзыв в бэк: `POST {KPI_SALES_API_URL}api/ai-analytics/review`
 * с JSON и таймаутом. Никогда не бросает — сеть, таймаут и 5xx становятся
 * «попробуйте ещё раз», 429 — «подождите», отказ бэка (400 или
 * `resultCode: 1`) — его же текстом, чтобы руководитель увидел, что именно
 * не так: «ссылка не на разбор этого портала» и подобное.
 */
export const sendRopReview = async (
    payload: RopReviewPayload,
): Promise<RopReviewSendResult> => {
    let response: Response;
    try {
        response = await fetch(ropReviewBackendUrl(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(ROP_REVIEW_TIMEOUT_MS),
        });
    } catch (error) {
        console.error('Rop review send error:', error);
        return {
            ok: false,
            status: 502,
            error: ROP_REVIEW_SEND_ERROR.unavailable,
        };
    }

    if (response.status === 429) {
        return { ok: false, status: 429, error: ROP_REVIEW_SEND_ERROR.tooMany };
    }

    const envelope = await readEnvelope(response);
    if (response.status === 400 || envelope.resultCode === 1) {
        return {
            ok: false,
            status: 400,
            error: envelope.message || ROP_REVIEW_SEND_ERROR.rejected,
        };
    }
    if (!response.ok || envelope.resultCode !== 0) {
        console.error('Rop review backend error:', response.status, envelope);
        return {
            ok: false,
            status: 502,
            error: ROP_REVIEW_SEND_ERROR.unavailable,
        };
    }
    return { ok: true };
};
