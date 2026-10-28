import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { UnknownAction } from '@reduxjs/toolkit';

const h = vi.hoisted(() => ({
    switched: [] as UnknownAction[],
}));

// Смена пользователя (чистка формы и бут заново) проверяется отдельно —
// здесь только какое действие ей передали.
vi.mock('@/modules/app/model/thunk/AppUserSwitchThunk', () => ({
    switchAppUser: (apply: UnknownAction) => async () => {
        h.switched.push(apply);
    },
}));

import type { BXUser } from '@workspace/bx';
import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import {
    DEPARTAMENT_STATE_PROP,
    DUSER_ROLE,
} from '@/modules/features/Departament/type/department-type';
import { impersonationActions } from './ImpersonationSlice';
import { startImpersonation, stopImpersonation } from './ImpersonationThunk';

const user = (id: number, name: string, lastName: string): BXUser =>
    ({ ID: id, NAME: name, LAST_NAME: lastName }) as unknown as BXUser;

const SUPER = user(447, 'Пётр', 'Петров');
const EMPLOYEE = user(231, 'Анна', 'Сидорова');

const makeState = (
    over: {
        isSuperUser?: boolean;
        target?: BXUser | null;
        users?: BXUser[];
    } = {},
) =>
    ({
        app: { bitrix: { user: SUPER } },
        headMode: { isSuperUser: over.isSuperUser ?? true },
        impersonation: {
            realUser: over.target ? SUPER : null,
            target: over.target ?? null,
        },
        department: {
            [DEPARTAMENT_STATE_PROP.DEPARTAMENT]: {
                [DUSER_ROLE.RESPONSIBLE]: {
                    items: over.users ?? [SUPER, EMPLOYEE],
                },
            },
        },
    }) as never;

const run = async <T>(
    thunk: (dispatch: AppDispatch, getState: AppGetState) => Promise<T>,
    state: ReturnType<typeof makeState>,
): Promise<T> => {
    const dispatch = (async (action: unknown) =>
        typeof action === 'function'
            ? action(dispatch, () => state)
            : action) as unknown as AppDispatch;
    return thunk(dispatch, () => state);
};

describe('startImpersonation', () => {
    beforeEach(() => {
        h.switched = [];
    });

    it('суперпользователь выбрал сотрудника — бут под ним', async () => {
        await expect(run(startImpersonation(231), makeState())).resolves.toBe(
            true,
        );
        expect(h.switched).toEqual([
            impersonationActions.started({ realUser: SUPER, target: EMPLOYEE }),
        ]);
    });

    it('не суперпользователь — ничего не меняется', async () => {
        await expect(
            run(startImpersonation(231), makeState({ isSuperUser: false })),
        ).resolves.toBe(false);
        expect(h.switched).toEqual([]);
    });

    it('сотрудника нет в отделе — ничего не меняется', async () => {
        await expect(
            run(startImpersonation(231), makeState({ users: [SUPER] })),
        ).resolves.toBe(false);
        expect(h.switched).toEqual([]);
    });

    it('режим уже включён — второй раз не включается', async () => {
        await expect(
            run(startImpersonation(231), makeState({ target: EMPLOYEE })),
        ).resolves.toBe(false);
        expect(h.switched).toEqual([]);
    });
});

describe('stopImpersonation', () => {
    beforeEach(() => {
        h.switched = [];
    });

    it('режим включён — возврат к себе', async () => {
        await run(stopImpersonation(), makeState({ target: EMPLOYEE }));
        expect(h.switched).toEqual([impersonationActions.stopped()]);
    });

    it('режима нет — бут не перезапускается', async () => {
        await run(stopImpersonation(), makeState());
        expect(h.switched).toEqual([]);
    });
});
