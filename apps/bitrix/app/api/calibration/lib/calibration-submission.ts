/**
 * Контракт онлайн-брифа калибровки между страницей и маршрутом
 * `/api/calibration`. Клиент собирает объект в
 * `how-we-work/lib/build-submission.ts`, маршрут разбирает его здесь же —
 * единственное место, где решается, что считать годным телом.
 */

/** Длины полей — как у DTO бэка (`TELEGRAM_FIELD_MAX_LENGTH`). */
export const SUBMISSION_FIELD_MAX_LENGTH = 200;

/** Потолок протокола: бриф из ~50 ответов помещается с запасом. */
export const SUBMISSION_PROTOCOL_MAX_LENGTH = 60_000;

export interface CalibrationBriefSubmission {
    /** Организация из подвала анкеты */
    company: string;
    /** Кто заполнил */
    respondent: string;
    /** Домен портала Битрикс24 из ответа анкеты */
    domain: string;
    /** Готовый текст протокола (`buildProtocol`) */
    protocol: string;
    /**
     * Honeypot: поле, которого человек не видит и не заполняет. Непустое
     * значение — бот; маршрут отвечает «ок», но ничего не отправляет.
     */
    website: string;
}

export type CalibrationSubmitResponse =
    | { ok: true; parts: number }
    | { ok: false; error: string };

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null;

const readString = (source: Record<string, unknown>, key: string): string => {
    const value = source[key];
    return typeof value === 'string' ? value.trim() : '';
};

const clip = (value: string, max: number): string =>
    value.length > max ? value.slice(0, max) : value;

/**
 * Разбор тела запроса. Возвращает `null`, если это не бриф: нет протокола
 * или он длиннее потолка. Короткие поля режутся до лимита DTO, а не
 * отвергаются — лишние символы в названии компании не повод терять бриф.
 */
export const parseSubmission = (
    body: unknown,
): CalibrationBriefSubmission | null => {
    if (!isRecord(body)) return null;
    const protocol = readString(body, 'protocol');
    if (!protocol || protocol.length > SUBMISSION_PROTOCOL_MAX_LENGTH) {
        return null;
    }
    return {
        company: clip(readString(body, 'company'), SUBMISSION_FIELD_MAX_LENGTH),
        respondent: clip(
            readString(body, 'respondent'),
            SUBMISSION_FIELD_MAX_LENGTH,
        ),
        domain: clip(readString(body, 'domain'), SUBMISSION_FIELD_MAX_LENGTH),
        protocol,
        website: readString(body, 'website'),
    };
};
