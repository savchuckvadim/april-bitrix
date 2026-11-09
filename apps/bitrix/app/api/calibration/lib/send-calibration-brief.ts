import type { CalibrationBriefSubmission } from './calibration-submission';
import { sendBrief } from './send-brief';

/** Бриф калибровки → чат «April Client» с темой «Бриф калибровки: …». */
export const sendCalibrationBrief = async (
    submission: CalibrationBriefSubmission,
): Promise<number> => sendBrief(submission, 'calibration');
