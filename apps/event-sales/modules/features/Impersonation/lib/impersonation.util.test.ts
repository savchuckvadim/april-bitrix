import { describe, expect, it } from 'vitest';
import type { BXUser } from '@workspace/bx';
import {
    buildImpersonator,
    canImpersonate,
    resolveBootUser,
} from './impersonation.util';

/** Суперпользователь 447 работает как сотрудник 231; 500 — другой вход. */
const user = (id: number, name: string, lastName: string): BXUser =>
    ({ ID: id, NAME: name, LAST_NAME: lastName }) as unknown as BXUser;

const SUPER = user(447, 'Пётр', 'Петров');
const EMPLOYEE = user(231, 'Анна', 'Сидорова');
const OTHER = user(500, 'Иван', 'Иванов');

const OFF = { realUser: null, target: null };
const ON = { realUser: SUPER, target: EMPLOYEE };

describe('resolveBootUser', () => {
    it('режима нет — бут под тем, кто открыл фрейм', () => {
        expect(resolveBootUser(SUPER, OFF)).toBe(SUPER);
    });

    it('режим включил тот же человек — бут под сотрудником', () => {
        expect(resolveBootUser(SUPER, ON)).toBe(EMPLOYEE);
    });

    it('фрейм открыл другой человек — подмены нет', () => {
        expect(resolveBootUser(OTHER, ON)).toBe(OTHER);
    });

    it('сотрудник без владельца режима — подмены нет', () => {
        expect(
            resolveBootUser(SUPER, { realUser: null, target: EMPLOYEE }),
        ).toBe(SUPER);
    });
});

describe('buildImpersonator', () => {
    it('режима нет — поля в отчёте нет', () => {
        expect(buildImpersonator(OFF)).toBeUndefined();
    });

    it('режим включён — id и имя суперпользователя', () => {
        expect(buildImpersonator(ON)).toEqual({
            ID: 447,
            NAME: 'Петров Пётр',
        });
    });

    it('нет владельца режима — поля нет', () => {
        expect(
            buildImpersonator({ realUser: null, target: EMPLOYEE }),
        ).toBeUndefined();
    });
});

describe('canImpersonate', () => {
    const base = { isSuperUser: true, session: OFF, myId: 447, targetId: 231 };

    it('суперпользователь, режим выключен, чужой сотрудник — можно', () => {
        expect(canImpersonate(base)).toBe(true);
    });

    it('не суперпользователь — нельзя', () => {
        expect(canImpersonate({ ...base, isSuperUser: false })).toBe(false);
    });

    it('режим уже включён — сначала вернуться к себе', () => {
        expect(canImpersonate({ ...base, session: ON })).toBe(false);
    });

    it('сам себя или пустой выбор — нельзя', () => {
        expect(canImpersonate({ ...base, targetId: 447 })).toBe(false);
        expect(canImpersonate({ ...base, targetId: 0 })).toBe(false);
    });
});
