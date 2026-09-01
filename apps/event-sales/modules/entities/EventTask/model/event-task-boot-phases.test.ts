import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Метка «до списка дел» — в КАЖДОЙ терминальной ветке списка.
 *
 * Пока метка стояла в одной ветке «дела нашлись», главная цифра владельца
 * («сколько идёт первая загрузка») молчала на целом классе загрузок:
 * встройка задачи и карточки звонка (список берётся из уже известной задачи,
 * запроса нет вовсе), пустой список у менеджера, отсутствие привязки к CRM,
 * упавший запрос. Во всех четырёх случаях список ДОШЁЛ до терминального
 * состояния, экран перестал крутить скелетон — а наблюдение не публиковалось,
 * и воронка «сколько бутов дошло до дел» смешивала «медленно» с «дел нет» и
 * «не та встройка».
 *
 * Исход при этом разделён отдельными фазами: `tasks-empty` («грузить было
 * нечего») и `tasks-error` («запрос упал») — чтобы отличать их от честного
 * «дела приехали», а не догадываться по молчанию.
 */

const h = vi.hoisted(() => ({
    getList: vi.fn(),
}));

vi.mock('@workspace/bitrix', () => ({
    Bitrix: {
        getService: () => ({ task: { getList: h.getList } }),
    },
}));

vi.mock('@/modules/app/lib/utills/app-config-wait', () => ({
    waitForAppConfig: vi.fn(async () => undefined),
}));

vi.mock('@/modules/entities/EventContact/model/EventContactThunk', () => ({
    setCurrentReportContact: vi.fn(() => ({
        type: 'test/setCurrentReportContact',
    })),
}));

// Разбор задач Битрикса к фазам бута отношения не имеет — его закрывает
// task-util.test; здесь важно только, какие ветки списка терминальны.
vi.mock('../lib/task-util', () => ({
    getEvTasksFromBxTasks: (tasks: unknown[]) => tasks,
}));

import {
    markBootPhase,
    readBootPhases,
    resetBootPhasesForTests,
} from '@/modules/app/lib/diagnostics/boot-phases';
import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import type { EventTask } from '../types/event-task-type';
import { APP_FROM_ENUM } from '@/modules/app/model/slice/AppSlice';
import {
    initialEventTasks,
    initialTasksFromCurrentTask,
} from './EventTaskThunk';

const dispatched: string[] = [];

const dispatch = ((action: { type: string }) => {
    dispatched.push(action.type);
    return action;
}) as unknown as AppDispatch;

const getState = (() => ({
    app: { config: { taskGroupId: 42 } },
})) as unknown as AppGetState;

const phases = (): string[] => readBootPhases().map(row => row.phase);

const runList = (companyId: number | null) =>
    initialEventTasks(
        [],
        7,
        companyId,
        'a.bitrix24.ru',
        null,
        null,
        APP_FROM_ENUM.COMPANY,
    )(dispatch, getState);

beforeEach(() => {
    performance.clearMarks();
    resetBootPhasesForTests();
    dispatched.length = 0;
    h.getList.mockReset();
    // Бут начался: без него окно сводки не с чего отсчитывать.
    markBootPhase('init-start');
    vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
    performance.clearMarks();
    vi.restoreAllMocks();
});

describe('фаза «до списка дел» во всех терминальных ветках', () => {
    it('дела приехали — фаза стоит, исход не помечен', async () => {
        h.getList.mockResolvedValue({ result: { tasks: [{ id: 1 }] } });

        await runList(5);

        expect(phases()).toContain('tasks-fetched');
        expect(phases()).not.toContain('tasks-empty');
        expect(phases()).not.toContain('tasks-error');
    });

    it('пустой список — фаза стоит, исход «грузить нечего»', async () => {
        h.getList.mockResolvedValue({ result: { tasks: [] } });

        await runList(5);

        expect(phases()).toContain('tasks-fetched');
        expect(phases()).toContain('tasks-empty');
    });

    it('нет привязки к CRM — фаза стоит, исход «грузить нечего»', async () => {
        await runList(null);

        expect(h.getList).not.toHaveBeenCalled();
        expect(phases()).toContain('tasks-fetched');
        expect(phases()).toContain('tasks-empty');
    });

    it('запрос упал — фаза стоит, исход «ошибка»', async () => {
        h.getList.mockRejectedValue(new Error('нет сети'));

        await runList(5);

        expect(phases()).toContain('tasks-fetched');
        expect(phases()).toContain('tasks-error');
        expect(phases()).not.toContain('tasks-empty');
    });

    it('встройка задачи / карточки звонка — фаза стоит без запроса', async () => {
        const task = { id: 1, name: 'Дело' } as unknown as EventTask;

        await initialTasksFromCurrentTask([task])(dispatch);

        expect(h.getList).not.toHaveBeenCalled();
        expect(phases()).toContain('tasks-fetched');
    });

    it('точечный перезапрос списка второго наблюдения не добавляет', async () => {
        h.getList.mockResolvedValue({ result: { tasks: [{ id: 1 }] } });

        await runList(5);
        // «flow отработал → список устарел»: тот же thunk зовётся ещё раз,
        // но бут остался прежним, и фаза обязана быть одна.
        await runList(5);

        expect(
            phases().filter(phase => phase === 'tasks-fetched'),
        ).toHaveLength(1);
    });
});
