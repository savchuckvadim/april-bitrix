import { beforeEach, describe, expect, it, vi } from 'vitest';

const h = vi.hoisted(() => ({
    resolve: vi.fn(),
    getSalesDepartment: vi.fn(),
}));

vi.mock('@workspace/api', async importOriginal => ({
    ...(await importOriginal<typeof import('@workspace/api')>()),
    resolveSwrCache: h.resolve,
}));

vi.mock('../lib/api/department-helper', () => ({
    DepartmentHelper: class {
        getSalesDepartment = h.getSalesDepartment;
    },
}));

import type { BXUser } from '@workspace/bx';
import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import type { CachedDepartment } from '../lib/department-cache';
import { getDepartment } from './DepartmentThunk';

const user = (id: number, name: string): BXUser =>
    ({ ID: String(id), NAME: name }) as unknown as BXUser;

const ME = user(481, 'Иван');
const CACHED: CachedDepartment = {
    users: [ME, user(231, 'Пётр')],
    structure: null,
};
const FRESH: CachedDepartment = {
    users: [ME, user(231, 'Пётр'), user(465, 'Анна')],
    structure: null,
};

interface PlainAction {
    type: string;
    payload?: { department?: BXUser[] | null };
}

/** Колбэк обновления, который получил кэш. */
type OnUpdate = (fresh: CachedDepartment) => void;

const run = () => {
    const actions: PlainAction[] = [];
    const getState = (() => ({
        app: { config: { bossId: 1 } },
    })) as unknown as AppGetState;
    const dispatch = ((action: unknown) => {
        actions.push(action as PlainAction);
        return action;
    }) as unknown as AppDispatch;
    const types = () => actions.map(action => action.type);
    const usersOf = (type: string) =>
        actions
            .find(action => action.type === type)
            ?.payload?.department?.map(u => Number(u.ID));
    return { dispatch, getState, types, usersOf };
};

beforeEach(() => {
    h.resolve.mockReset();
    h.getSalesDepartment.mockReset();
});

describe('отдел: из кэша браузера сразу, свежий — в фоне', () => {
    it('сначала отдел из кэша, свежий потом обновляет только списки', async () => {
        let onUpdate: OnUpdate = () => undefined;
        h.resolve.mockImplementation((options: { onUpdate: OnUpdate }) => {
            onUpdate = options.onUpdate;
            return Promise.resolve({ value: CACHED, source: 'stale' });
        });
        const ctx = run();

        await getDepartment('garant.bitrix24.ru', ME)(
            ctx.dispatch,
            ctx.getState,
        );
        expect(ctx.types()).toEqual(['department/setFetchedDepartament']);
        expect(ctx.usersOf('department/setFetchedDepartament')).toEqual([
            481, 231,
        ]);

        onUpdate(FRESH);

        // Выбранных в форме людей фон не сбрасывает: второго
        // setFetchedDepartament нет, только обновление списков.
        expect(ctx.types()).toEqual([
            'department/setFetchedDepartament',
            'department/updateDepartament',
        ]);
        expect(ctx.usersOf('department/updateDepartament')).toEqual([
            481, 231, 465,
        ]);
    });

    it('свежий совпал с кэшем — стор не трогаем', async () => {
        let onUpdate: OnUpdate = () => undefined;
        h.resolve.mockImplementation((options: { onUpdate: OnUpdate }) => {
            onUpdate = options.onUpdate;
            return Promise.resolve({ value: CACHED, source: 'stale' });
        });
        const ctx = run();

        await getDepartment('garant.bitrix24.ru', ME)(
            ctx.dispatch,
            ctx.getState,
        );
        onUpdate({ ...CACHED });

        expect(ctx.types()).toEqual(['department/setFetchedDepartament']);
    });

    it('свежий успел раньше показа кэша — показываем сразу свежий', async () => {
        h.resolve.mockImplementation((options: { onUpdate: OnUpdate }) => {
            options.onUpdate(FRESH);
            return Promise.resolve({ value: CACHED, source: 'stale' });
        });
        const ctx = run();

        await getDepartment('garant.bitrix24.ru', ME)(
            ctx.dispatch,
            ctx.getState,
        );

        expect(ctx.types()).toEqual(['department/setFetchedDepartament']);
        expect(ctx.usersOf('department/setFetchedDepartament')).toEqual([
            481, 231, 465,
        ]);
    });

    it('ни кэша, ни сети — список не ломаем, ошибка в консоль', async () => {
        const error = vi.spyOn(console, 'error').mockImplementation(() => {});
        h.resolve.mockRejectedValue(new Error('сеть'));
        const ctx = run();

        await getDepartment('garant.bitrix24.ru', ME)(
            ctx.dispatch,
            ctx.getState,
        );

        expect(ctx.types()).toEqual([]);
        expect(error).toHaveBeenCalled();
    });
});
