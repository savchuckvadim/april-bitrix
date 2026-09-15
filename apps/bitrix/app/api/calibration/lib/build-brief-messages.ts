import { CalibrationBriefSubmission } from './calibration-submission';
import {
    splitTelegramText,
    TELEGRAM_PART_MAX_LENGTH,
} from './split-telegram-text';

/** Начало темы по умолчанию — бриф калибровки. */
export const CALIBRATION_SUBJECT_PREFIX = 'Бриф калибровки';

/** Тема сообщения: «<префикс>: <компания / домен>». */
export const buildBriefSubject = (
    submission: Pick<CalibrationBriefSubmission, 'company' | 'domain'>,
    subjectPrefix: string = CALIBRATION_SUBJECT_PREFIX,
): string => {
    const who = [submission.company, submission.domain]
        .filter(Boolean)
        .join(' / ');
    return `${subjectPrefix}: ${who || 'реквизиты не указаны'}`;
};

/** Запас под заголовок части: тема + «(часть N из M)» + пустая строка. */
const HEADER_RESERVE = 300;

/**
 * Протокол → сообщения в Telegram. Каждая часть начинается с темы и номера,
 * чтобы длинный бриф собирался обратно в чате без догадок.
 */
export const buildBriefMessages = (
    submission: CalibrationBriefSubmission,
    subjectPrefix: string = CALIBRATION_SUBJECT_PREFIX,
): string[] => {
    const subject = buildBriefSubject(submission, subjectPrefix);
    const bodies = splitTelegramText(
        submission.protocol,
        TELEGRAM_PART_MAX_LENGTH - HEADER_RESERVE,
    );
    const total = bodies.length;
    return bodies.map((body, index) => {
        const counter = total > 1 ? ` (часть ${index + 1} из ${total})` : '';
        return `${subject}${counter}\n\n${body}`;
    });
};
