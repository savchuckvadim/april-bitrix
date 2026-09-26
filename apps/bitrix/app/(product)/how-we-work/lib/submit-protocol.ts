import type {
    CalibrationSubmitResponse,
    QuestionnaireSubmission,
} from '@/app/api/calibration/lib/calibration-submission';

const NETWORK_ERROR = 'Нет связи — проверьте интернет и повторите';

/**
 * Отправка протокола в маршрут приложения (`/api/calibration` и другие
 * двери анкет), который уже пересылает его дальше. Никогда не бросает:
 * сетевой сбой и кривой ответ превращаются в `{ ok: false, error }`, чтобы
 * кнопка показала «повторить».
 */
export const submitProtocol = async (
    path: string,
    submission: QuestionnaireSubmission,
): Promise<CalibrationSubmitResponse> => {
    try {
        const response = await fetch(path, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(submission),
        });
        const body = (await response.json()) as CalibrationSubmitResponse;
        if (!response.ok && body.ok) {
            return { ok: false, error: `Ошибка отправки (${response.status})` };
        }
        return body;
    } catch {
        return { ok: false, error: NETWORK_ERROR };
    }
};
