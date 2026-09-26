/**
 * Перевод `AuthData` SDK в `BxFrameAuth`: хост портала из origin фрейма,
 * пустые member_id/expires_in → null.
 */
import { describe, expect, it } from 'vitest';
import type { AuthData } from '@bitrix24/b24jssdk';
import { portalHostname, toBxFrameAuth } from '../frame-auth.util';

const authData = (overrides: Partial<AuthData> = {}): AuthData => ({
    access_token: 'frame-token',
    refresh_token: 'refresh-id',
    expires: 1_800_000_000,
    expires_in: 3600,
    domain: 'https://april.bitrix24.ru',
    member_id: 'member-1',
    ...overrides,
});

describe('portalHostname', () => {
    it('origin фрейма → имя хоста', () => {
        expect(portalHostname('https://april.bitrix24.ru')).toBe(
            'april.bitrix24.ru',
        );
    });

    it('голый хост, хост с путём и с портом → имя хоста', () => {
        expect(portalHostname('april.bitrix24.ru')).toBe('april.bitrix24.ru');
        expect(portalHostname('april.bitrix24.ru/rest/')).toBe(
            'april.bitrix24.ru',
        );
        expect(portalHostname('https://april.bitrix24.ru:443/app/')).toBe(
            'april.bitrix24.ru',
        );
        expect(portalHostname('  APRIL.bitrix24.ru ')).toBe(
            'april.bitrix24.ru',
        );
    });
});

describe('toBxFrameAuth', () => {
    it('переносит access_token, хост, member_id и expires_in', () => {
        expect(toBxFrameAuth(authData())).toEqual({
            accessToken: 'frame-token',
            domain: 'april.bitrix24.ru',
            memberId: 'member-1',
            expiresIn: 3600,
        });
    });

    it('пустой member_id и нечисловой expires_in → null', () => {
        expect(
            toBxFrameAuth(
                authData({
                    member_id: '',
                    expires_in: Number.NaN,
                }),
            ),
        ).toMatchObject({ memberId: null, expiresIn: null });
    });
});
