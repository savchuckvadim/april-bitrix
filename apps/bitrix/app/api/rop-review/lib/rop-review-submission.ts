/**
 * Контракт отзыва руководителя между страницей `/ai/rop` и маршрутом
 * `/api/rop-review`: из структурных ответов анкеты (`answers`) собирается
 * JSON для бэка `kpi-sales`. Подписи вариантов переводятся в коды по картам
 * из файла анкеты — один источник и для формы, и для маршрута, чтобы
 * переименованный вариант не превращался в молча потерянный отзыв.
 */

import {
    ROP_REVIEW_AUTHOR_ROLE,
    ROP_REVIEW_ERROR,
    ROP_REVIEW_ISSUE,
    ROP_REVIEW_LIMITS,
    ROP_REVIEW_LINK_PATTERN,
    ROP_REVIEW_QUESTION_ID,
    ROP_REVIEW_VERDICT,
    ROP_REVIEW_VERDICTS_NEEDING_COMMENT,
    type RopReviewAuthorRole,
    type RopReviewIssue,
    type RopReviewVerdict,
} from '@/app/(product)/ai/constants/rop-review-questionnaire';

/** JSON отзыва, который маршрут шлёт в бэк `kpi-sales`. */
export interface RopReviewPayload {
    /** Адрес карточки разбора в Битрикс24 */
    link: string;
    /** Как обращаться к автору */
    authorName: string;
    authorRole: RopReviewAuthorRole;
    verdict: RopReviewVerdict;
    /** Коды пунктов «что не так», без повторов, в порядке анкеты */
    issues: RopReviewIssue[];
    /** Что именно и как должно быть; пусто при полном согласии */
    comment: string;
    /** Контакт для уточнений; нет ключа — не указан */
    contact?: string;
    /** Текстовый протокол анкеты целиком */
    protocol: string;
}

export type RopReviewPayloadResult =
    | { ok: true; payload: RopReviewPayload }
    | { ok: false; error: string };

/** Ошибки разбора тела, которых нет у проверки на клиенте. */
export const ROP_REVIEW_PARSE_ERROR = {
    authorName: 'Не указано, как к вам обращаться',
    authorRole: 'Роль не распознана — обновите страницу и отправьте снова',
    verdict: 'Вердикт не распознан — обновите страницу и отправьте снова',
    issue: 'Пункт «что не так» не распознан — обновите страницу и отправьте снова',
} as const;

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null;

const isStringArray = (value: unknown): value is string[] =>
    Array.isArray(value) && value.every(item => typeof item === 'string');

type AnswerValue = string | string[];

/** `answers` тела → карта «id вопроса → значение»; кривые элементы пропускаются. */
const readAnswers = (body: unknown): Map<string, AnswerValue> => {
    const answers = new Map<string, AnswerValue>();
    if (!isRecord(body) || !Array.isArray(body.answers)) return answers;
    for (const item of body.answers) {
        if (!isRecord(item) || typeof item.id !== 'string') continue;
        if (typeof item.value === 'string') {
            answers.set(item.id, item.value.trim());
        } else if (isStringArray(item.value)) {
            answers.set(item.id, item.value);
        }
    }
    return answers;
};

const text = (answers: Map<string, AnswerValue>, id: string): string => {
    const value = answers.get(id);
    return typeof value === 'string' ? value : '';
};

const list = (answers: Map<string, AnswerValue>, id: string): string[] => {
    const value = answers.get(id);
    return Array.isArray(value) ? value : [];
};

const clip = (value: string, max: number): string =>
    value.length > max ? value.slice(0, max) : value;

/** Код по подписи варианта; чужая подпись — `undefined`. */
const codeOf = <T extends Record<string, string>>(
    map: T,
    label: string,
): T[keyof T] | undefined =>
    Object.prototype.hasOwnProperty.call(map, label)
        ? map[label as keyof T]
        : undefined;

/**
 * Пункты «что не так» → коды без повторов. Чужая подпись — ошибка, а не
 * пропуск: отзыв с потерянным пунктом хуже отзыва, который попросили
 * отправить заново.
 */
const readIssues = (labels: string[]): RopReviewIssue[] | undefined => {
    const codes: RopReviewIssue[] = [];
    for (const label of labels) {
        const code = codeOf(ROP_REVIEW_ISSUE, label);
        if (!code) return undefined;
        if (!codes.includes(code)) codes.push(code);
    }
    return codes;
};

/**
 * Собирает JSON для бэка из ответов анкеты. Проверяет то же, что и клиент
 * (шаблон ссылки, комментарий при несогласии, потолок комментария), плюс
 * то, что клиент проверить не может: что подписи вариантов ещё известны
 * картам. Короткие поля режутся до лимита, а не отвергаются.
 */
export const parseRopReviewPayload = (
    body: unknown,
    protocol: string,
): RopReviewPayloadResult => {
    const answers = readAnswers(body);
    const ID = ROP_REVIEW_QUESTION_ID;

    const link = text(answers, ID.analysisLink);
    if (!ROP_REVIEW_LINK_PATTERN.test(link)) {
        return { ok: false, error: ROP_REVIEW_ERROR.link };
    }

    const authorName = clip(
        text(answers, ID.authorName),
        ROP_REVIEW_LIMITS.authorName,
    );
    if (!authorName) {
        return { ok: false, error: ROP_REVIEW_PARSE_ERROR.authorName };
    }

    const authorRole = codeOf(
        ROP_REVIEW_AUTHOR_ROLE,
        text(answers, ID.authorRole),
    );
    if (!authorRole) {
        return { ok: false, error: ROP_REVIEW_PARSE_ERROR.authorRole };
    }

    const verdictLabel = text(answers, ID.verdict);
    const verdict = codeOf(ROP_REVIEW_VERDICT, verdictLabel);
    if (!verdict) return { ok: false, error: ROP_REVIEW_PARSE_ERROR.verdict };

    const issues = readIssues(list(answers, ID.issues));
    if (!issues) return { ok: false, error: ROP_REVIEW_PARSE_ERROR.issue };

    const comment = text(answers, ID.comment);
    if (
        ROP_REVIEW_VERDICTS_NEEDING_COMMENT.includes(verdictLabel) &&
        !comment
    ) {
        return { ok: false, error: ROP_REVIEW_ERROR.commentRequired };
    }
    if (comment.length > ROP_REVIEW_LIMITS.comment) {
        return { ok: false, error: ROP_REVIEW_ERROR.commentTooLong };
    }

    const contact = clip(text(answers, ID.contact), ROP_REVIEW_LIMITS.contact);

    return {
        ok: true,
        payload: {
            link,
            authorName,
            authorRole,
            verdict,
            issues,
            comment,
            ...(contact ? { contact } : {}),
            protocol,
        },
    };
};
