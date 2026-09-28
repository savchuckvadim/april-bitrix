import { LEGACY_CREDENTIALS_TEXT } from '../consts/legacy-credentials.const';
import type {
    LegacyCredentials,
    LegacyCredentialsSave,
    SecretsCarryOver,
} from '../model';

/** Формат ключа, который ждут бэки: `rest/<ID пользователя>/<код>`. */
const HOOK_KEY_RE = /^rest\/\d+\/[A-Za-z0-9]+$/;
const URL_ORIGIN_RE = /^https?:\/\/([^/]+)/i;

/**
 * Приводит ввод к ключу вебхука. Принимает полный URL из Битрикса
 * (`https://portal.bitrix24.ru/rest/1/abc/`) или сам ключ; срезает домен и
 * слеши по краям: бэк сам клеит `https://${domain}/${key}/${method}`.
 */
export const normalizeHookKey = (input: string): string =>
    input
        .trim()
        .replace(URL_ORIGIN_RE, '')
        .replace(/^\/+|\/+$/g, '');

/** Домен из вставленного URL; для голого ключа — null. */
export const extractHookDomain = (input: string): string | null =>
    URL_ORIGIN_RE.exec(input.trim())?.[1]?.toLowerCase() ?? null;

/** Маска ключа для показа: видны префикс и края кода. */
export const maskHookKey = (key?: string): string => {
    if (!key) return '—';
    const match = /^(rest\/\d+\/)(.+)$/.exec(key);
    const prefix = match?.[1];
    const code = match?.[2];
    if (!prefix || !code) return '••••••';
    return code.length <= 4
        ? `${prefix}••••`
        : `${prefix}${code.slice(0, 2)}••••${code.slice(-2)}`;
};

/**
 * Client ID/secret переносятся как есть. У вебхук-порталов они исторически
 * равны ключу (Laravel `POST portal` пишет всё одним значением), тогда они
 * следуют за новым ключом. Пустое значение Laravel не примет, поэтому оно
 * тоже заменяется новым ключом.
 */
const carryOver = (
    value: string | undefined,
    oldKey: string | undefined,
    nextKey: string,
): string => (!value || value === oldKey ? nextKey : value);

const followsKey = (value: string | undefined, oldKey: string | undefined) =>
    !value || value === oldKey;

export const getSecretsCarryOver = (
    current: LegacyCredentials,
): SecretsCarryOver => {
    const id = followsKey(current.C_REST_CLIENT_ID, current.key);
    const secret = followsKey(current.C_REST_CLIENT_SECRET, current.key);
    if (id && secret) return 'follow';
    if (!id && !secret) return 'keep';
    return 'mixed';
};

/** Тело записи: ключ и вебхук одним значением, остальное — перенос. */
export const buildLegacyCredentialsSave = (params: {
    domain: string;
    number: number;
    nextKey: string;
    current: LegacyCredentials;
}): LegacyCredentialsSave => {
    const { domain, number, nextKey, current } = params;
    return {
        domain,
        number,
        key: nextKey,
        hook: nextKey,
        clientId: carryOver(current.C_REST_CLIENT_ID, current.key, nextKey),
        clientSecret: carryOver(
            current.C_REST_CLIENT_SECRET,
            current.key,
            nextKey,
        ),
    };
};

/** Причина, по которой ввод нельзя записать; null — можно (или ввод пуст). */
export const getHookDraftError = (params: {
    draft: string;
    nextKey: string;
    domain?: string;
    number?: number;
    current?: LegacyCredentials;
}): string | null => {
    const { draft, nextKey, domain, number, current } = params;
    if (!draft.trim()) return null;
    if (!HOOK_KEY_RE.test(nextKey)) return LEGACY_CREDENTIALS_TEXT.invalidFormat;

    const pastedDomain = extractHookDomain(draft);
    if (pastedDomain && domain && pastedDomain !== domain.toLowerCase()) {
        return LEGACY_CREDENTIALS_TEXT.foreignDomain(pastedDomain, domain);
    }
    if (
        current?.key === nextKey &&
        current?.C_REST_WEB_HOOK_URL === nextKey
    ) {
        return LEGACY_CREDENTIALS_TEXT.unchanged;
    }
    if (number === undefined || number === null) {
        return LEGACY_CREDENTIALS_TEXT.noNumber;
    }
    return null;
};
