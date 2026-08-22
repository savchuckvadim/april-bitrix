import type { CheckPresentationValue } from '../type/check-presentation-type';

/**
 * Как ответы опросника ложатся в поля Битрикса. Данные и преобразования
 * отдельно от запросов.
 */

/** Значение ответа в том виде, в каком его принимает пользовательское поле. */
export const toPortalValue = (value: CheckPresentationValue): string | null => {
    if (typeof value === 'boolean') return value ? 'Y' : 'N';
    if (Array.isArray(value)) {
        // Множественный список пишется id-шниками элементов, а их в ответах
        // нет: такие поля пока не переносим, вместо тихой порчи — пропуск.
        return null;
    }
    const text = String(value ?? '').trim();
    return text || null;
};

export interface PortalFieldWriteInput {
    /** Ответы опросника: код поля → значение. */
    answers: Record<string, CheckPresentationValue>;
    /** Резолвер ключа поля у конкретной сущности; нет поля — null. */
    resolveKey: (code: string) => string | null;
}

/**
 * Payload для `*.update`: только те ответы, под которые на портале ЕСТЬ поле.
 *
 * Полей может не быть вовсе (портал без установки), и писать наугад по
 * `UF_CRM_<КОД>` нельзя — это ровно та ошибка, из-за которой характеристики
 * контакта не читались.
 */
export const buildPortalFieldPayload = ({
    answers,
    resolveKey,
}: PortalFieldWriteInput): Record<string, string> => {
    const payload: Record<string, string> = {};

    for (const [code, value] of Object.entries(answers)) {
        const key = resolveKey(code);
        if (!key) continue;
        const portalValue = toPortalValue(value);
        if (portalValue === null) continue;
        payload[key] = portalValue;
    }

    return payload;
};

/** Порядок и подписи сводки — те же «К», что в анкете. */
const FIVE_K_SUMMARY_CODES = [
    'op_5k_client_what',
    'op_5k_client_ready',
    'op_5k_client_price',
    'op_5k_company_who',
    'op_5k_company_how',
    'op_5k_company_right',
    'op_5k_command',
    'op_5k_concurent',
    'op_5k_criteri',
] as const;

/**
 * Сводное «Пять К» из ответов анкеты: `ЗАГОЛОВОК: ответ` построчно.
 *
 * Отдельные op_5k_* живут только на лиде, а сводка — и на сделке: тот, кто
 * открыл сделку без лида, всё равно видит итог презентации одним полем.
 * Пустые ответы пропускаются; не ответили ни на один — сводки нет, пустую
 * строку не пишем (она стёрла бы прошлую).
 */
export const buildFiveKSummary = (
    answers: Record<string, CheckPresentationValue>,
    titleByCode: Record<string, string>,
): string | null => {
    const lines: string[] = [];

    for (const code of FIVE_K_SUMMARY_CODES) {
        const value = toPortalValue(answers[code] ?? '');
        if (!value) continue;
        const title = titleByCode[code] ?? code;
        lines.push(`${title} ${value}`);
    }

    return lines.length ? lines.join('\n') : null;
};
