import {
    CalibrationSubmitResponse,
    parseSubmission,
} from '../calibration/lib/calibration-submission';
import { RecentSubmissions } from '../calibration/lib/recent-submissions';
import { parseRopReviewPayload } from './lib/rop-review-submission';
import { sendRopReview } from './lib/send-rop-review';

/**
 * Приём отзыва руководителя на разбор звонка со страницы `/ai/rop` и
 * передача его в бэк `kpi-sales`, где отзыв ложится рядом с разбором и
 * уходит нам в чат. Ответ всегда JSON `CalibrationSubmitResponse` — тот же
 * конверт, что у брифов, чтобы кнопка «Отправить нам» работала одинаково.
 *
 * Дверь та же, что у брифов: honeypot (бот получает «ок» и тишину), повтор
 * того же протокола в пределах окна — 409, кривое тело — 400. Отказ бэка
 * (ссылка не на разбор этого портала и подобное) — 400 его же текстом,
 * лимит — 429, сеть и 5xx — 502, чтобы клиент показал «повторить».
 */
const recent = new RecentSubmissions();

const json = (body: CalibrationSubmitResponse, status: number): Response =>
    Response.json(body, { status });

export async function POST(request: Request): Promise<Response> {
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return json({ ok: false, error: 'Тело запроса не JSON' }, 400);
    }

    const submission = parseSubmission(body);
    if (!submission) {
        return json(
            { ok: false, error: 'Протокол пуст или не прошёл проверку' },
            400,
        );
    }

    if (submission.website) {
        return json({ ok: true, parts: 0 }, 200);
    }

    const parsed = parseRopReviewPayload(body, submission.protocol);
    if (!parsed.ok) {
        return json({ ok: false, error: parsed.error }, 400);
    }

    if (recent.isDuplicate(submission.protocol)) {
        return json(
            { ok: false, error: 'Этот отзыв уже отправлен — мы его получили' },
            409,
        );
    }

    const result = await sendRopReview(parsed.payload);
    if (!result.ok) {
        return json({ ok: false, error: result.error }, result.status);
    }
    recent.remember(submission.protocol);
    return json({ ok: true, parts: 1 }, 200);
}
