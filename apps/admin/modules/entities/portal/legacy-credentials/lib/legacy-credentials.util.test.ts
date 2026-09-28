import { describe, expect, it } from 'vitest';
import { LEGACY_CREDENTIALS_TEXT } from '../consts/legacy-credentials.const';
import {
    buildLegacyCredentialsSave,
    extractHookDomain,
    getHookDraftError,
    getSecretsCarryOver,
    maskHookKey,
    normalizeHookKey,
} from './legacy-credentials.util';

const OLD = 'rest/2153/l9xhe8xijt3lq9yh';
const NEXT = 'rest/2153/694q9yfyzlimj2n2';
const DOMAIN = 'gsirk.bitrix24.ru';

describe('normalizeHookKey', () => {
    it('срезает домен и слеши из URL Битрикса', () => {
        expect(normalizeHookKey(`https://${DOMAIN}/${NEXT}/`)).toBe(NEXT);
    });
    it('голый ключ и пробелы', () => {
        expect(normalizeHookKey(`  /${NEXT}/  `)).toBe(NEXT);
    });
});

describe('extractHookDomain', () => {
    it('домен из URL, null для ключа', () => {
        expect(extractHookDomain(`https://GSIRK.bitrix24.ru/${NEXT}/`)).toBe(
            DOMAIN,
        );
        expect(extractHookDomain(NEXT)).toBeNull();
    });
});

describe('maskHookKey', () => {
    it('прячет середину кода', () => {
        expect(maskHookKey(NEXT)).toBe('rest/2153/69••••n2');
        expect(maskHookKey(undefined)).toBe('—');
    });
});

describe('getHookDraftError', () => {
    const current = { key: OLD, C_REST_WEB_HOOK_URL: OLD };
    const base = { domain: DOMAIN, number: 12, current };

    it('пустой ввод — без ошибки', () => {
        expect(getHookDraftError({ ...base, draft: '', nextKey: '' })).toBeNull();
    });
    it('неверный формат', () => {
        expect(
            getHookDraftError({ ...base, draft: 'abc', nextKey: 'abc' }),
        ).toBe(LEGACY_CREDENTIALS_TEXT.invalidFormat);
    });
    it('вебхук чужого портала', () => {
        const draft = `https://alfacenter.bitrix24.ru/${NEXT}/`;
        expect(
            getHookDraftError({ ...base, draft, nextKey: NEXT }),
        ).toBe(
            LEGACY_CREDENTIALS_TEXT.foreignDomain(
                'alfacenter.bitrix24.ru',
                DOMAIN,
            ),
        );
    });
    it('тот же ключ уже записан', () => {
        expect(getHookDraftError({ ...base, draft: OLD, nextKey: OLD })).toBe(
            LEGACY_CREDENTIALS_TEXT.unchanged,
        );
    });
    it('без номера портала запись невозможна', () => {
        expect(
            getHookDraftError({
                ...base,
                number: undefined,
                draft: NEXT,
                nextKey: NEXT,
            }),
        ).toBe(LEGACY_CREDENTIALS_TEXT.noNumber);
    });
    it('валидный новый ключ', () => {
        expect(
            getHookDraftError({ ...base, draft: NEXT, nextKey: NEXT }),
        ).toBeNull();
    });
});

describe('buildLegacyCredentialsSave', () => {
    it('client ID/secret, равные старому ключу, следуют за новым', () => {
        const current = {
            key: OLD,
            C_REST_WEB_HOOK_URL: OLD,
            C_REST_CLIENT_ID: OLD,
            C_REST_CLIENT_SECRET: OLD,
        };
        expect(getSecretsCarryOver(current)).toBe('follow');
        expect(
            buildLegacyCredentialsSave({
                domain: DOMAIN,
                number: 12,
                nextKey: NEXT,
                current,
            }),
        ).toEqual({
            domain: DOMAIN,
            number: 12,
            key: NEXT,
            hook: NEXT,
            clientId: NEXT,
            clientSecret: NEXT,
        });
    });
    it('настоящие client ID/secret переносятся без изменений', () => {
        const current = {
            key: OLD,
            C_REST_WEB_HOOK_URL: OLD,
            C_REST_CLIENT_ID: 'local.abc',
            C_REST_CLIENT_SECRET: 'secret-xyz',
        };
        expect(getSecretsCarryOver(current)).toBe('keep');
        const body = buildLegacyCredentialsSave({
            domain: DOMAIN,
            number: 12,
            nextKey: NEXT,
            current,
        });
        expect(body.clientId).toBe('local.abc');
        expect(body.clientSecret).toBe('secret-xyz');
    });
    it('пустые client ID/secret заменяются ключом (Laravel не примет пустые)', () => {
        const body = buildLegacyCredentialsSave({
            domain: DOMAIN,
            number: 12,
            nextKey: NEXT,
            current: { key: OLD },
        });
        expect(body.clientId).toBe(NEXT);
        expect(body.clientSecret).toBe(NEXT);
    });
});
