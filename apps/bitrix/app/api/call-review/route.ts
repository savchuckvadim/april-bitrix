import {
    CalibrationSubmitResponse,
    parseSubmission,
} from '../calibration/lib/calibration-submission';
import { RecentSubmissions } from '../calibration/lib/recent-submissions';
import { sendCallReviewBrief } from './lib/send-call-review-brief';

/**
 * Приём брифа оценки звонка со страницы `/ai/briefs` и пересылка его в
 * Telegram. Дверь та же, что у брифа калибровки, и обязанности те же:
 * honeypot (бот получает «ок» и тишину), повтор того же текста в пределах
 * окна — 409, кривое тело — 400, сбой бэка — 502, чтобы клиент показал
 * «повторить», а не «отправлено».
 *
 * Своя память недавних отправок: бриф калибровки и бриф оценки звонка —
 * разные заявки, и повтор одного не должен глушить другой.
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

    if (recent.isDuplicate(submission.protocol)) {
        return json(
            { ok: false, error: 'Этот бриф уже отправлен — мы его получили' },
            409,
        );
    }

    try {
        const parts = await sendCallReviewBrief(submission);
        recent.remember(submission.protocol);
        return json({ ok: true, parts }, 200);
    } catch (error) {
        console.error('Call review brief send error:', error);
        return json(
            {
                ok: false,
                error: 'Не удалось передать бриф — попробуйте ещё раз',
            },
            502,
        );
    }
}
