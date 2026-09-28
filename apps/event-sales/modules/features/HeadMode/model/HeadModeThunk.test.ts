import { beforeEach, describe, expect, it, vi } from 'vitest';

const h = vi.hoisted(() => ({
    getCurrentUser: vi.fn(),
    saved: null as boolean | null,
    save: vi.fn(),
}));

vi.mock('../lib/api/head-mode-helper', () => ({
    HeadModeHelper: class {
        getCurrentUser = h.getCurrentUser;
    },
}));

vi.mock('../lib/head-mode-storage', () => ({
    getSavedHeadModeEnabled: () => h.saved,
    saveHeadModeEnabled: h.save,
}));

import type { BXUser } from '@workspace/bx';
import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import {
    DEPARTAMENT_STATE_PROP,
    DUSER_ROLE,
} from '@/modules/features/Departament/type/department-type';
import {
    assignPlanTo,
    fetchHeadPerimeter,
    switchHeadMode,
    syncActingFromTask,
} from './HeadModeThunk';

/** Руководитель 481, сотрудники 231 и 465; 700 — человек из другого отдела. */
const user = (id: number, name: string, lastName: string): BXUser =>
    ({ ID: id, NAME: name, LAST_NAME: lastName }) as unknown as BXUser;

const HEAD = user(481, 'Иван', 'Иванов');
const PETROV = user(231, 'Пётр', 'Петров');
const SIDOROVA = user(465, 'Анна', 'Сидорова');

interface Scenario {
    enabled?: boolean;
    subordinateIds?: number[];
    status?: string;
    /** Ответственный открытого дела; undefined — дела нет. */
    taskResponsibleId?: number;
    taskResponsibleName?: string;
    /** На кого сейчас записано дело. */
    responsible?: BXUser | null;
    me?: BXUser | null;
}

interface PlainAction {
    type: string;
    payload?: { from?: string; role?: string; value?: BXUser };
}

const run = (scenario: Scenario) => {
    const state = {
        app: { bitrix: { user: scenario.me === undefined ? HEAD : scenario.me } },
        headMode: {
            status: scenario.status ?? 'ready',
            enabled: scenario.enabled ?? true,
            subordinateIds: scenario.subordinateIds ?? [231, 465],
        },
        eventTask: {
            current:
                scenario.taskResponsibleId === undefined
                    ? null
                    : {
                          id: 900,
                          responsibleId: String(scenario.taskResponsibleId),
                          responsible: {
                              name: scenario.taskResponsibleName ?? '',
                          },
                      },
        },
        department: {
            [DEPARTAMENT_STATE_PROP.DEPARTAMENT]: {
                [DUSER_ROLE.RESPONSIBLE]: { items: [PETROV, SIDOROVA] },
            },
            [DEPARTAMENT_STATE_PROP.PLAN]: {
                [DUSER_ROLE.RESPONSIBLE]: {
                    current:
                        scenario.responsible === undefined
                            ? HEAD
                            : scenario.responsible,
                },
            },
        },
    };
    const actions: PlainAction[] = [];
    const getState = (() => state) as unknown as AppGetState;
    const dispatch = ((action: unknown) => {
        if (typeof action === 'function') {
            return (
                action as (d: AppDispatch, g: AppGetState) => unknown
            )(dispatch, getState);
        }
        actions.push(action as PlainAction);
        return action;
    }) as unknown as AppDispatch;

    /** На кого записали отчёт и дело; null — записи не трогали. */
    const assignedTo = (): number | null => {
        const last = actions
            .filter(action => action.type === 'department/setCurrentUser')
            .at(-1);
        return last ? Number(last.payload?.value?.ID) : null;
    };

    return { dispatch, getState, actions, assignedTo };
};

beforeEach(() => {
    h.getCurrentUser.mockReset();
    h.save.mockReset();
    h.saved = null;
    vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('за кого идёт работа — по открытому делу', () => {
    it('открыли дело сотрудника — отчёт и дело записаны на него', () => {
        const ctx = run({ taskResponsibleId: 231 });

        ctx.dispatch(syncActingFromTask());

        expect(ctx.assignedTo()).toBe(231);
        // И план, и отчёт: одно без другого дало бы отчёт на чужое имя.
        expect(
            ctx.actions
                .filter(a => a.type === 'department/setCurrentUser')
                .map(a => a.payload?.from),
        ).toEqual([DEPARTAMENT_STATE_PROP.PLAN, DEPARTAMENT_STATE_PROP.REPORT]);
    });

    it('закрыли дело — работа возвращается на себя, сотрудник не «прилипает»', () => {
        const ctx = run({ responsible: PETROV });

        ctx.dispatch(syncActingFromTask());

        expect(ctx.assignedTo()).toBe(481);
    });

    it('после дела сотрудника открыли своё — работа за себя', () => {
        const ctx = run({ taskResponsibleId: 481, responsible: PETROV });

        ctx.dispatch(syncActingFromTask());

        expect(ctx.assignedTo()).toBe(481);
    });

    it('дело человека вне подчинения — работа за себя', () => {
        const ctx = run({ taskResponsibleId: 700, responsible: HEAD });

        ctx.dispatch(syncActingFromTask());

        expect(ctx.assignedTo()).toBeNull();
    });

    it('режим выключен — дело сотрудника отрабатывается от себя', () => {
        const ctx = run({
            enabled: false,
            taskResponsibleId: 231,
            responsible: PETROV,
        });

        ctx.dispatch(syncActingFromTask());

        expect(ctx.assignedTo()).toBe(481);
    });

    it('ничего не изменилось — лишних записей нет', () => {
        const ctx = run({ taskResponsibleId: 231, responsible: PETROV });

        ctx.dispatch(syncActingFromTask());

        expect(ctx.actions).toHaveLength(0);
    });

    it('сотрудник не из списка отдела — имя берётся из задачи', () => {
        const ctx = run({
            subordinateIds: [700],
            taskResponsibleId: 700,
            taskResponsibleName: 'Олег Смирнов',
        });

        ctx.dispatch(syncActingFromTask());

        const action = ctx.actions.at(-1);
        expect(Number(action?.payload?.value?.ID)).toBe(700);
        expect(action?.payload?.value?.NAME).toBe('Олег Смирнов');
    });

    it('пользователь ещё неизвестен — ничего не делаем', () => {
        const ctx = run({ me: null, taskResponsibleId: 231 });

        ctx.dispatch(syncActingFromTask());

        expect(ctx.actions).toHaveLength(0);
    });
});

describe('выбор «кому дело»', () => {
    it('дело записывается на выбранного сотрудника', () => {
        const ctx = run({});

        ctx.dispatch(assignPlanTo(465));

        expect(ctx.assignedTo()).toBe(465);
    });

    it('пустой выбор ничего не меняет', () => {
        const ctx = run({});

        ctx.dispatch(assignPlanTo(0));

        expect(ctx.actions).toHaveLength(0);
    });
});

describe('загрузка списка подчинённых', () => {
    it('список получен — сохраняется', async () => {
        h.getCurrentUser.mockResolvedValue({ subordinateIds: [231, 465] });
        const ctx = run({ status: 'idle', subordinateIds: [] });

        await fetchHeadPerimeter('a.bitrix24.ru', 481)(
            ctx.dispatch,
            ctx.getState,
        );

        expect(ctx.actions.map(a => a.type)).toEqual([
            'headMode/setLoading',
            'headMode/setFetched',
        ]);
    });

    it('запрос упал — работаем как обычный менеджер, без падения', async () => {
        h.getCurrentUser.mockRejectedValue(new Error('нет сети'));
        const ctx = run({ status: 'idle', subordinateIds: [] });

        await fetchHeadPerimeter('a.bitrix24.ru', 481)(
            ctx.dispatch,
            ctx.getState,
        );

        expect(ctx.actions.map(a => a.type)).toEqual([
            'headMode/setLoading',
            'headMode/setFailed',
        ]);
    });

    it('список уже получен — повторного запроса нет', async () => {
        const ctx = run({ status: 'ready' });

        await fetchHeadPerimeter('a.bitrix24.ru', 481)(
            ctx.dispatch,
            ctx.getState,
        );

        expect(h.getCurrentUser).not.toHaveBeenCalled();
    });

    it('после ошибки следующий запуск пробует снова', async () => {
        h.getCurrentUser.mockResolvedValue({ subordinateIds: [] });
        const ctx = run({ status: 'error', subordinateIds: [] });

        await fetchHeadPerimeter('a.bitrix24.ru', 481)(
            ctx.dispatch,
            ctx.getState,
        );

        expect(h.getCurrentUser).toHaveBeenCalledTimes(1);
    });

    it('сохранённый выбор тумблера применяется до ответа бэка', async () => {
        h.saved = false;
        h.getCurrentUser.mockResolvedValue({ subordinateIds: [231] });
        const ctx = run({ status: 'idle', subordinateIds: [] });

        await fetchHeadPerimeter('a.bitrix24.ru', 481)(
            ctx.dispatch,
            ctx.getState,
        );

        expect(ctx.actions[0]).toMatchObject({
            type: 'headMode/setEnabled',
            payload: { enabled: false },
        });
    });

    it('пользователь неизвестен — запроса нет', async () => {
        const ctx = run({ status: 'idle', subordinateIds: [] });

        await fetchHeadPerimeter('a.bitrix24.ru', 0)(
            ctx.dispatch,
            ctx.getState,
        );

        expect(h.getCurrentUser).not.toHaveBeenCalled();
        expect(ctx.actions.map(a => a.type)).toEqual(['headMode/setFailed']);
    });
});

describe('тумблер режима', () => {
    it('выбор запоминается и применяется', () => {
        const ctx = run({});

        ctx.dispatch(switchHeadMode(false));

        expect(h.save).toHaveBeenCalledWith(false);
        expect(ctx.actions.at(-1)).toMatchObject({
            type: 'headMode/setEnabled',
            payload: { enabled: false },
        });
    });
});
