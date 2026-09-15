import type { CalibrationBriefSubmission } from '../../calibration/lib/calibration-submission';
import { sendBrief } from '../../calibration/lib/send-brief';

/**
 * Маркер отправителя брифа оценки звонка («App: …»): в общем чате он
 * отличает заявку на разбор от брифа калибровки и от тревог приложений.
 */
export const CALL_REVIEW_TELEGRAM_APP = 'bitrix-site-call-review';

/** Начало темы сообщения. */
export const CALL_REVIEW_SUBJECT_PREFIX = 'Бриф оценки звонка';

/**
 * Бриф оценки звонка уходит тем же путём, что бриф калибровки: тот же чат
 * бэка, то же разбиение длинного текста на части — меняются только маркер
 * приложения и тема.
 */
export const sendCallReviewBrief = async (
    submission: CalibrationBriefSubmission,
): Promise<number> =>
    sendBrief(submission, {
        app: CALL_REVIEW_TELEGRAM_APP,
        subjectPrefix: CALL_REVIEW_SUBJECT_PREFIX,
    });
