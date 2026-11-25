import { beforeEach, describe, expect, it } from 'vitest';
import {
    isLoadedKey,
    isSavedFilterApplied,
    markLoadedKey,
    markSavedFilterApplied,
    needsRequest,
    resetReportFlowMemory,
    resolveReportFlowRequestKey,
    setCurrentKey,
} from '../report-queue.util';

const DATE = { from: '2026-11-01', to: '2026-11-20' };
const user = (id: number) => ({ ID: id });

beforeEach(() => {
    resetReportFlowMemory();
});

describe('resolveReportFlowRequestKey', () => {
    it('ключ — период и отсортированные ID выбранных сотрудников', () => {
        expect(
            resolveReportFlowRequestKey(DATE, [user(3), user(1)], [user(9)]),
        ).toBe('2026-11-01|2026-11-20|1_3');
    });

    it('никто не выбран — берутся все видимые, как в запросах', () => {
        expect(
            resolveReportFlowRequestKey(DATE, [], [user(2), user(1)]),
        ).toBe('2026-11-01|2026-11-20|1_2');
    });

    it('нет периода или сотрудников — запрашивать нечего', () => {
        expect(
            resolveReportFlowRequestKey({ from: '', to: DATE.to }, [user(1)], []),
        ).toBeNull();
        expect(
            resolveReportFlowRequestKey({ from: DATE.from, to: '' }, [user(1)], []),
        ).toBeNull();
        expect(resolveReportFlowRequestKey(DATE, [], [])).toBeNull();
    });
});

describe('память «загружено»', () => {
    it('отметка ставится на вид источника и ключ', () => {
        markLoadedKey('report', 'A');
        expect(isLoadedKey('report', 'A')).toBe(true);
        expect(isLoadedKey('report', 'B')).toBe(false);
        expect(isLoadedKey('calling', 'A')).toBe(false);
    });

    it('новый ключ вытесняет прежний', () => {
        markLoadedKey('report', 'A');
        markLoadedKey('report', 'B');
        expect(isLoadedKey('report', 'A')).toBe(false);
        expect(isLoadedKey('report', 'B')).toBe(true);
    });

    it('сброс очищает отметки и готовность фильтра', () => {
        markLoadedKey('calling', 'A');
        markSavedFilterApplied();
        resetReportFlowMemory();
        expect(isLoadedKey('calling', 'A')).toBe(false);
        expect(isSavedFilterApplied()).toBe(false);
    });
});

describe('needsRequest', () => {
    it('ничего не загружено и не запрашивается — нужно', () => {
        expect(needsRequest('report', 'A', false)).toBe(true);
    });

    it('загружено для ключа — не нужно', () => {
        markLoadedKey('report', 'A');
        expect(needsRequest('report', 'A', false)).toBe(false);
    });

    it('запрашивается прямо сейчас по этому ключу — не нужно', () => {
        setCurrentKey('report', 'A');
        expect(needsRequest('report', 'A', true)).toBe(false);
    });

    it('идёт запрос по другому ключу — по этому нужно', () => {
        setCurrentKey('report', 'B');
        expect(needsRequest('report', 'A', true)).toBe(true);
    });

    it('ключ текущий, но запрос закончился неудачей — нужно', () => {
        setCurrentKey('report', 'A');
        expect(needsRequest('report', 'A', false)).toBe(true);
    });
});
