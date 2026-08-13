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
