import type { V1Parsed, V1Record } from './types';

/**
 * Защищённый разбор легаси-слепка: каждое поле — JSON-строка, любое может
 * отсутствовать или быть битым. Легаси падал на JSON.parse(undefined)
 * (iskraConfig) — здесь любой сбой поля попадает в parseErrors, не роняя всё.
 */

const safeParse = <T>(
    raw: string | null | undefined,
    field: string,
    errors: string[],
): T | null => {
    if (raw === null || raw === undefined || raw === '' || raw === 'null') {
        return null;
    }
    try {
        return JSON.parse(raw) as T;
    } catch {
        errors.push(field);
        return null;
    }
};

export const parseV1 = (record: V1Record): V1Parsed => {
    const errors: string[] = [];

    const currentComplect = safeParse<V1Parsed['currentComplect']>(
        record.currentComplect,
        'currentComplect',
        errors,
    );
    const od = safeParse<{ currentOd?: { number?: number } }>(
        record.od,
        'od',
        errors,
    );
    const contract = safeParse<{
        current?: { number: number; shortName?: string; code?: string };
    }>(record.contract, 'contract', errors);
    const rows = safeParse<V1Parsed['rows']>(record.rows, 'rows', errors);
    const regions = safeParse<V1Parsed['regions']>(
        record.regions,
        'regions',
        errors,
    );
    const global = safeParse<{ currentRegion?: V1Parsed['globalRegion'] }>(
        record.global,
        'global',
        errors,
    );

    return {
        dealId: record.dealId ?? null,
        domain: record.domain ?? null,
        currentComplect,
        odNumber: od?.currentOd?.number ?? null,
        contract: contract?.current ?? null,
        rows,
        regions,
        globalRegion: global?.currentRegion ?? null,
        templateId: record.templateId ?? null,
        parseErrors: errors,
    };
};

/** Признак «сделка запомнена» (легаси getIsHaveDeal) */
export const hasDealData = (parsed: V1Parsed): boolean =>
    Boolean(parsed.rows?.sets?.general?.[0]?.total?.[0]?.name);
