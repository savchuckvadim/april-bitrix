import { describe, expect, it } from 'vitest';
import {
    applyOwnAbs,
    applyToggle,
    effectiveState,
    toBulkItems,
    type PendingRegionChange,
    type ServerRegionState,
} from './region-draft.util';

/** На сервере: регион 1 включён, регион 2 выключен */
const server = (): Map<number, ServerRegionState> =>
    new Map([
        [1, { enabled: true }],
        [2, { enabled: false }],
    ]);

const empty = (): Map<number, PendingRegionChange> => new Map();

describe('черновик регионов портала: галочки', () => {
    it('выключение включённого региона попадает в черновик', () => {
        const changes = applyToggle(empty(), server(), 1, false);

        expect(changes.size).toBe(1);
        expect(changes.get(1)).toEqual({
            regionId: 1,
            enabled: false,
            ownAbs: undefined,
        });
    });

    it('возврат галочки к состоянию на сервере убирает правку из черновика', () => {
        const off = applyToggle(empty(), server(), 1, false);
        const backOn = applyToggle(off, server(), 1, true);

        expect(backOn.size).toBe(0);
    });

    it('возврат галочки не теряет заданный свой рабс', () => {
        const withAbs = applyOwnAbs(empty(), 1, '5000');
        const backOn = applyToggle(withAbs, server(), 1, true);

        expect(backOn.get(1)).toEqual({
            regionId: 1,
            enabled: true,
            ownAbs: '5000',
        });
    });

    it('включение выключенного региона попадает в черновик', () => {
        const changes = applyToggle(empty(), server(), 2, true);

        expect(changes.get(2)?.enabled).toBe(true);
    });

    it('исходный черновик не мутируется', () => {
        const original = empty();
        applyToggle(original, server(), 1, false);

        expect(original.size).toBe(0);
    });
});

describe('черновик регионов портала: свой рабс', () => {
    it('свой рабс выключенному региону включает его вместе с правкой', () => {
        const changes = applyOwnAbs(empty(), 2, '4200.50');

        expect(changes.get(2)).toEqual({
            regionId: 2,
            enabled: true,
            ownAbs: '4200.50',
        });
    });

    it('сброс своего рабса передаётся как null, а не как пустая строка', () => {
        const changes = applyOwnAbs(empty(), 1, null);

        expect(changes.get(1)?.ownAbs).toBeNull();
    });

    it('свой рабс не сбрасывает уже снятую галочку', () => {
        const off = applyToggle(empty(), server(), 1, false);
        const withAbs = applyOwnAbs(off, 1, '100');

        expect(withAbs.get(1)).toEqual({
            regionId: 1,
            enabled: false,
            ownAbs: '100',
        });
    });
});

describe('состояние для таблицы', () => {
    it('без правок берётся состояние с сервера', () => {
        expect(effectiveState(empty(), server(), 1).enabled).toBe(true);
        expect(effectiveState(empty(), server(), 2).enabled).toBe(false);
    });

    it('правка перебивает серверное состояние', () => {
        const changes = applyToggle(empty(), server(), 1, false);

        expect(effectiveState(changes, server(), 1).enabled).toBe(false);
    });

    it('неизвестный регион считается выключенным', () => {
        expect(effectiveState(empty(), server(), 999).enabled).toBe(false);
    });
});

describe('черновик → запрос', () => {
    it('свой рабс передаётся только когда его правили', () => {
        let changes = applyToggle(empty(), server(), 2, true);
        changes = applyOwnAbs(changes, 1, '7000');

        const items = toBulkItems(changes);
        const plain = items.find(item => item.regionId === 2);
        const withAbs = items.find(item => item.regionId === 1);

        expect(plain).toEqual({ regionId: 2, enabled: true });
        expect('ownAbs' in (plain ?? {})).toBe(false);
        expect(withAbs).toEqual({
            regionId: 1,
            enabled: true,
            ownAbs: '7000',
        });
    });

    it('сброс рабса уходит явным null', () => {
        const changes = applyOwnAbs(empty(), 1, null);

        expect(toBulkItems(changes)).toEqual([
            { regionId: 1, enabled: true, ownAbs: null },
        ]);
    });

    it('пустой черновик даёт пустой список', () => {
        expect(toBulkItems(empty())).toEqual([]);
    });
});
