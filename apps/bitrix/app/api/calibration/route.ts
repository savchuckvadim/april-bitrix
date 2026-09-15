import {
    CalibrationSubmitResponse,
    parseSubmission,
} from './lib/calibration-submission';
import { RecentSubmissions } from './lib/recent-submissions';
import { sendCalibrationBrief } from './lib/send-calibration-brief';

/**
 * Приём онлайн-брифа калибровки со страницы `/ai/briefs`
 * и пересылка его в Telegram. Ответ всегда JSON `CalibrationSubmitResponse`.
 *
 * Защита публичной двери: honeypot (бот получает «ок» и тишину), повтор того
 * же текста в пределах окна — 409, кривое тело — 400. Сбой бэка — 502, чтобы
 * клиент показал «повторить», а не «отправлено».
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
        return json({ ok: false, error: 'Протокол пуст или не прошёл проверку' }, 400);
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
        const parts = await sendCalibrationBrief(submission);
        recent.remember(submission.protocol);
        return json({ ok: true, parts }, 200);
    } catch (error) {
        console.error('Calibration brief send error:', error);
        return json(
            { ok: false, error: 'Не удалось передать бриф — попробуйте ещё раз' },
            502,
        );
    }
}
