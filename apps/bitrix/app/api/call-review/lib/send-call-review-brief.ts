import type { CalibrationBriefSubmission } from '../../calibration/lib/calibration-submission';
import { sendBrief } from '../../calibration/lib/send-brief';

/**
 * Бриф оценки звонка уходит тем же путём, что бриф калибровки: тот же бэк и
 * чат, меняется только вид брифа — по нему бэк ставит тему
 * «Бриф оценки звонка: …».
 */
export const sendCallReviewBrief = async (
    submission: CalibrationBriefSubmission,
): Promise<number> => sendBrief(submission, 'call-review');
