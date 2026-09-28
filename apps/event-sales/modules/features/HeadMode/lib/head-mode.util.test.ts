import { describe, expect, it } from 'vitest';
import type { BXUser } from '@workspace/bx';
import {
    buildActingManager,
    buildAssigneeOptions,
    findAssignee,
    resolveActingEmployeeId,
    resolveTaskResponsibleIds,
    userFullName,
} from './head-mode.util';

/** Руководитель 481, его сотрудники 231 и 465; 700 — человек из другого отдела. */
const SUBORDINATES = [231, 465];

const user = (id: number, name: string, lastName: string): BXUser =>
    ({ ID: id, NAME: name, LAST_NAME: lastName }) as unknown as BXUser;

const HEAD = user(481, 'Иван', 'Иванов');
const USERS = [user(231, 'Пётр', 'Петров'), user(465, 'Анна', 'Сидорова')];

describe('чьи дела показывать', () => {
    it('режим включён — свои и сотрудников', () => {
        expect(resolveTaskResponsibleIds(481, SUBORDINATES, true)).toEqual([
            481, 231, 465,
        ]);
    });

    it('режим выключен — только свои', () => {
        expect(resolveTaskResponsibleIds(481, SUBORDINATES, false)).toEqual([
            481,
        ]);
    });

    it('сотрудников нет — только свои, даже при включённом режиме', () => {
        expect(resolveTaskResponsibleIds(231, [], true)).toEqual([231]);
    });

    it('пользователь неизвестен — пустой список, а не дела «нулевого»', () => {
        expect(resolveTaskResponsibleIds(0, [], true)).toEqual([]);
    });

    it('повторы и мусор в списке не попадают в запрос', () => {
        expect(
            resolveTaskResponsibleIds(481, [231, 231, 0, 481, NaN], true),
        ).toEqual([481, 231]);
    });
});

describe('за кого идёт работа', () => {
    const base = {
        enabled: true,
        myId: 481,
        subordinateIds: SUBORDINATES,
    };

    it('дело сотрудника — работа за него', () => {
        expect(
            resolveActingEmployeeId({ ...base, taskResponsibleId: 231 }),
        ).toBe(231);
    });

    it('своё дело — работа за себя', () => {
        expect(
            resolveActingEmployeeId({ ...base, taskResponsibleId: 481 }),
        ).toBeNull();
    });

    it('дело человека вне подчинения — работа за себя', () => {
        expect(
            resolveActingEmployeeId({ ...base, taskResponsibleId: 700 }),
        ).toBeNull();
    });

    it('дела нет (новое событие) — работа за себя', () => {
        expect(
            resolveActingEmployeeId({ ...base, taskResponsibleId: null }),
        ).toBeNull();
    });

    it('режим выключен — работа за себя даже по делу сотрудника', () => {
        expect(
            resolveActingEmployeeId({
                ...base,
                enabled: false,
                taskResponsibleId: 231,
            }),
        ).toBeNull();
    });
});

describe('пометка «кто отчитался»', () => {
    const base = {
        enabled: true,
        me: HEAD,
        subordinateIds: SUBORDINATES,
    };

    it('дело записано на сотрудника — пометка с именем руководителя', () => {
        expect(buildActingManager({ ...base, planResponsibleId: 231 })).toEqual(
            { ID: 481, NAME: 'Иванов Иван' },
        );
    });

    it('дело записано на себя — пометки нет', () => {
        expect(
            buildActingManager({ ...base, planResponsibleId: 481 }),
        ).toBeUndefined();
    });

    it('сотрудник вне подчинения — пометки нет', () => {
        expect(
            buildActingManager({ ...base, planResponsibleId: 700 }),
        ).toBeUndefined();
    });

    it('режим выключен — пометки нет', () => {
        expect(
            buildActingManager({
                ...base,
                enabled: false,
                planResponsibleId: 231,
            }),
        ).toBeUndefined();
    });

    it('пользователь неизвестен — пометки нет', () => {
        expect(
            buildActingManager({ ...base, me: null, planResponsibleId: 231 }),
        ).toBeUndefined();
    });
});

describe('имена', () => {
    it('фамилия первой', () => {
        expect(userFullName(HEAD)).toBe('Иванов Иван');
    });

    it('имени нет — подпись с номером', () => {
        expect(userFullName({ ID: 12 } as unknown as BXUser)).toBe(
            'Сотрудник 12',
        );
    });

    it('сотрудник не из списка отдела — имя из задачи', () => {
        const found = findAssignee(700, USERS, 'Олег Смирнов');
        expect(Number(found.ID)).toBe(700);
        expect(found.NAME).toBe('Олег Смирнов');
    });

    it('сотрудник из списка — запись отдела целиком', () => {
        expect(findAssignee(231, USERS)).toBe(USERS[0]);
    });
});

describe('кому можно записать следующее дело', () => {
    const base = {
        me: HEAD,
        users: USERS,
        subordinateIds: SUBORDINATES,
    };

    it('дело сотрудника — только сотрудники, себя в списке нет', () => {
        const options = buildAssigneeOptions({
            ...base,
            isActing: true,
            current: USERS[0] ?? null,
        });
        expect(options.map(option => option.value)).toEqual(['231', '465']);
    });

    it('своё дело — можно себе и сотрудникам, себя видно первым', () => {
        const options = buildAssigneeOptions({
            ...base,
            isActing: false,
            current: HEAD,
        });
        expect(options.map(option => option.value)).toEqual([
            '481',
            '231',
            '465',
        ]);
        expect(options[0]?.hint).toBe('это вы');
    });

    it('подписи — «Фамилия Имя»', () => {
        const options = buildAssigneeOptions({
            ...base,
            isActing: true,
            current: null,
        });
        expect(options.map(option => option.label)).toEqual([
            'Петров Пётр',
            'Сидорова Анна',
        ]);
    });
});
