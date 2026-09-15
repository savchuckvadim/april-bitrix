import { CalibrationBriefSubmission } from './calibration-submission';
import { CALIBRATION_SUBJECT_PREFIX } from './build-brief-messages';
import { sendBrief } from './send-brief';

/**
 * Маркер отправителя в сообщении («App: …»): по нему бриф отличают от
 * тревог приложений в общем чате.
 */
export const CALIBRATION_TELEGRAM_APP = 'bitrix-site-calibration';

/** Онлайн-бриф калибровки — в общий чат, темой «Бриф калибровки: …». */
export const sendCalibrationBrief = async (
    submission: CalibrationBriefSubmission,
): Promise<number> =>
    sendBrief(submission, {
        app: CALIBRATION_TELEGRAM_APP,
        subjectPrefix: CALIBRATION_SUBJECT_PREFIX,
    });
