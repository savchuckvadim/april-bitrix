import { describe, expect, it } from 'vitest';
import {
    isVendorSuperUser,
    toShareCurrentUser,
} from '../lib/utils/share-current-user.util';
import type { CurrentUserInfo } from '../model';
import { makeCurrentUser, makeSuperUser } from './department-fixtures';

describe('toShareCurrentUser — роль в снимке публичной ссылки', () => {
    it('суперпользователь вендора — роль сброшена до прежней «без роли»', () => {
        expect(toShareCurrentUser(makeSuperUser())).toMatchObject({
            userId: 99,
            isSuperUser: false,
            headOf: null,
            headOfDepartmentIds: [],
            visibility: 'own',
            headOfSource: 'structure',
        });
    });

    it('исходный объект не мутируется', () => {
        const source = makeSuperUser();
        toShareCurrentUser(source);
        expect(source.headOf).toBe('cup');
        expect(source.isSuperUser).toBe(true);
    });

    it('узнаём суперпользователя и только по источнику роли', () => {
        const bySource = {
            ...makeSuperUser(),
            isSuperUser: undefined,
        } as unknown as CurrentUserInfo;
        expect(isVendorSuperUser(bySource)).toBe(true);
        expect(toShareCurrentUser(bySource)?.headOf).toBeNull();
    });

    it('руководитель портала — как есть', () => {
        const head = makeCurrentUser({
            headOf: 'op',
            visibility: 'department',
            headOfDepartmentIds: [10],
        });
        expect(toShareCurrentUser(head)).toBe(head);
    });

    it('старый снимок без новых полей и null — как есть', () => {
        const legacy = {
            userId: 5,
            isHead: false,
            headOf: null,
            headOfDepartmentIds: [],
        } as unknown as CurrentUserInfo;
        expect(isVendorSuperUser(legacy)).toBe(false);
        expect(toShareCurrentUser(legacy)).toBe(legacy);
        expect(toShareCurrentUser(null)).toBeNull();
    });
});
