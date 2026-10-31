import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    compositionViewActions,
    compositionViewReducer,
    selectCompositionView,
} from '../CompositionViewSlice';
import { fetchCompositionView, updateCompositionView } from '../CompositionViewThunk';
import { DEFAULT_COMPOSITION_VIEW, type CompositionViewSettings } from '../types';

/**
 * Где живёт выбор вида: копия в браузере даёт экран сразу, сервер — источник
 * истины. Выбор пользователя новее ответа, который ещё шёл.
 */
const server = vi.hoisted(() => ({
    read: vi.fn(),
    write: vi.fn(),
}));

vi.mock('../../lib/api/composition-view-helper', () => ({
    CompositionViewHelper: class {
        read = server.read;
        write = server.write;
    },
}));

const KEY = 'konstructor:composition-view:test.bitrix24.ru:7';
const dense: CompositionViewSettings = { mode: 'dense', showWeights: true };
const summary: CompositionViewSettings = { mode: 'summary', showWeights: false };

const makeStore = (userId: number | null = 7) => {
    let compositionView = compositionViewReducer(undefined, { type: '@@init' });
    const dispatch = (action: { type: string; payload?: unknown }) => {
        compositionView = compositionViewReducer(compositionView, action);
        return action;
    };
    if (userId) {
        dispatch(
            compositionViewActions.setOwner({
                domain: 'test.bitrix24.ru',
                bxUserId: userId,
            }),
        );
    }
    const getState = () => ({ compositionView });
    return {
        view: () => selectCompositionView(getState()),
        dispatch,
        run: (thunk: ReturnType<typeof fetchCompositionView>) =>
            thunk(dispatch as never, getState as never, undefined as never),
    };
};

describe('вид наполнения: браузер и сервер', () => {
    let storage: Map<string, string>;

    beforeEach(() => {
        storage = new Map();
        vi.stubGlobal('localStorage', {
            getItem: (key: string) => storage.get(key) ?? null,
            setItem: (key: string, value: string) => storage.set(key, value),
        });
        server.read.mockReset();
        server.write.mockReset();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('копия из браузера применяется сразу, до ответа сервера', async () => {
        storage.set(KEY, JSON.stringify(dense));
        let answer: (value: CompositionViewSettings | null) => void = () => undefined;
        server.read.mockReturnValue(new Promise(resolve => (answer = resolve)));
        const store = makeStore();

        const done = store.run(fetchCompositionView());
        expect(store.view()).toEqual(dense);

        answer(null);
        await done;
        expect(store.view()).toEqual(dense);
    });

    it('в браузере пусто — вид приходит с сервера и копируется', async () => {
        server.read.mockResolvedValue(summary);
        const store = makeStore();
        await store.run(fetchCompositionView());
        expect(store.view()).toEqual(summary);
        expect(JSON.parse(storage.get(KEY)!)).toEqual(summary);
    });

    it('сервер важнее старой копии: выбор сменили на другом компьютере', async () => {
        storage.set(KEY, JSON.stringify(dense));
        server.read.mockResolvedValue(summary);
        const store = makeStore();
        await store.run(fetchCompositionView());
        expect(store.view()).toEqual(summary);
        expect(JSON.parse(storage.get(KEY)!)).toEqual(summary);
    });

    it('выбор, сделанный пока шёл запрос, ответ сервера не перетирает', async () => {
        let answer: (value: CompositionViewSettings | null) => void = () => undefined;
        server.read.mockReturnValue(new Promise(resolve => (answer = resolve)));
        server.write.mockResolvedValue(undefined);
        const store = makeStore();

        const done = store.run(fetchCompositionView());
        await store.run(updateCompositionView({ mode: 'flat' }));
        answer(summary);
        await done;

        expect(store.view().mode).toBe('flat');
        expect(JSON.parse(storage.get(KEY)!).mode).toBe('flat');
    });

    it('смена вида пишется в браузер и на сервер', async () => {
        server.write.mockResolvedValue(undefined);
        const store = makeStore();
        await store.run(updateCompositionView({ showWeights: false }));
        const expected = { ...DEFAULT_COMPOSITION_VIEW, showWeights: false };
        expect(store.view()).toEqual(expected);
        expect(JSON.parse(storage.get(KEY)!)).toEqual(expected);
        expect(server.write).toHaveBeenCalledWith('test.bitrix24.ru', 7, expected);
    });

    it('сбой записи на сервер не откатывает выбор', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        server.write.mockRejectedValue(new Error('offline'));
        const store = makeStore();
        await store.run(updateCompositionView({ mode: 'dense' }));
        expect(store.view().mode).toBe('dense');
        expect(JSON.parse(storage.get(KEY)!).mode).toBe('dense');
        warn.mockRestore();
    });

    it('хранилище недоступно: настройка идёт только через сервер', async () => {
        vi.stubGlobal('localStorage', {
            getItem: () => {
                throw new Error('denied');
            },
            setItem: () => {
                throw new Error('denied');
            },
        });
        server.read.mockResolvedValue(dense);
        const store = makeStore();
        await store.run(fetchCompositionView());
        expect(store.view()).toEqual(dense);
    });

    it('битая копия не ломает старт', async () => {
        storage.set(KEY, '{oops');
        server.read.mockResolvedValue(null);
        const store = makeStore();
        await store.run(fetchCompositionView());
        expect(store.view()).toEqual(DEFAULT_COMPOSITION_VIEW);
    });

    describe('без владельца (публичная версия)', () => {
        const PUBLIC_KEY = 'konstructor:composition-view:public';

        it('вид читается только из браузера, в сеть не ходит', async () => {
            storage.set(PUBLIC_KEY, JSON.stringify(dense));
            const store = makeStore(null);
            await store.run(fetchCompositionView());
            expect(store.view()).toEqual(dense);
            expect(server.read).not.toHaveBeenCalled();
        });

        it('смена вида остаётся в браузере и не уходит на сервер', async () => {
            const store = makeStore(null);
            await store.run(updateCompositionView({ mode: 'dense' }));
            expect(store.view().mode).toBe('dense');
            expect(JSON.parse(storage.get(PUBLIC_KEY)!).mode).toBe('dense');
            expect(server.write).not.toHaveBeenCalled();
        });
    });
});
