import { describe, expect, it } from 'vitest';
import {
    applyOwnAbs,
    applyOwnSource,
    applyToggle,
    countInvalidOwnAbs,
    effectiveState,
    isValidOwnAbs,
    normalizeOwnAbsInput,
    ownPriceView,
    regionRowState,
    resolveDraftAbs,
    toBulkItems,
    type PendingRegionChange,
    type ServerRegionState,
} from './region-draft.util';

/** На сервере: 1 включён без своей цены, 2 выключен, 3 — ручной рабс, 4 — источник 1 */
const server = (): Map<number, ServerRegionState> =>
    new Map([
        [1, { enabled: true, ownAbs: null, ownAbsRegionId: null }],
        [2, { enabled: false, ownAbs: null, ownAbsRegionId: null }],
        [3, { enabled: true, ownAbs: 5000, ownAbsRegionId: null }],
        [4, { enabled: true, ownAbs: null, ownAbsRegionId: 1 }],
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
            ownAbsRegionId: undefined,
        });
    });

    it('возврат галочки к состоянию на сервере убирает правку из черновика', () => {
        const off = applyToggle(empty(), server(), 1, false);
        const backOn = applyToggle(off, server(), 1, true);

        expect(backOn.size).toBe(0);
    });

    it('возврат галочки не теряет заданный свой рабс и источник', () => {
        const withAbs = applyToggle(applyOwnAbs(empty(), 1, '5000'), server(), 1, true);
        expect(withAbs.get(1)).toMatchObject({ enabled: true, ownAbs: '5000' });

        const withSource = applyToggle(applyOwnSource(empty(), 1, 2), server(), 1, true);
        expect(withSource.get(1)).toMatchObject({ enabled: true, ownAbsRegionId: 2 });
    });

    it('включение выключенного региона попадает в черновик', () => {
        expect(applyToggle(empty(), server(), 2, true).get(2)?.enabled).toBe(true);
    });

    it('исходный черновик не мутируется', () => {
        const original = empty();
        applyToggle(original, server(), 1, false);

        expect(original.size).toBe(0);
    });
});

describe('черновик регионов портала: своя цена', () => {
    it('ручной рабс выключенному региону включает его вместе с правкой', () => {
        expect(applyOwnAbs(empty(), 2, '4200.50').get(2)).toEqual({
            regionId: 2,
            enabled: true,
            ownAbs: '4200.50',
        });
    });

    it('сброс передаётся как null, а не как пустая строка', () => {
        expect(applyOwnAbs(empty(), 1, null).get(1)?.ownAbs).toBeNull();
        expect(applyOwnSource(empty(), 1, null).get(1)?.ownAbsRegionId).toBeNull();
    });

    it('своя цена не сбрасывает уже снятую галочку', () => {
        const off = applyToggle(empty(), server(), 1, false);

        expect(applyOwnAbs(off, 1, '100').get(1)?.enabled).toBe(false);
        expect(applyOwnSource(off, 1, 2).get(1)?.enabled).toBe(false);
    });

    it('ручной рабс и источник вытесняют друг друга из черновика', () => {
        const source = applyOwnSource(empty(), 1, 2);
        const thenAbs = applyOwnAbs(source, 1, '100');
        expect(thenAbs.get(1)).toEqual({ regionId: 1, enabled: true, ownAbs: '100' });

        const backToSource = applyOwnSource(thenAbs, 1, 3);
        expect(backToSource.get(1)).toEqual({
            regionId: 1,
            enabled: true,
            ownAbsRegionId: 3,
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

describe('ячейка «Свой рабс»', () => {
    it('без черновика показывает серверное: ничего / ручной / источник', () => {
        expect(ownPriceView(undefined, server().get(1))).toEqual({ kind: 'none' });
        expect(ownPriceView(undefined, server().get(3))).toEqual({
            kind: 'manual',
            abs: '5000',
        });
        expect(ownPriceView(undefined, server().get(4))).toEqual({
            kind: 'source',
            regionId: 1,
        });
    });

    it('черновик перебивает сервер, null в черновике — сброс', () => {
        const manual = applyOwnAbs(empty(), 4, '777').get(4);
        expect(ownPriceView(manual, server().get(4))).toEqual({
            kind: 'manual',
            abs: '777',
        });

        const reset = applyOwnSource(empty(), 3, null).get(3);
        expect(ownPriceView(reset, server().get(3))).toEqual({ kind: 'none' });
    });

    it('действующий рабс: источник из справочника, ручной как число, иначе общий', () => {
        const abs = new Map([[1, 3000], [2, 4177.2]]);

        expect(resolveDraftAbs({ kind: 'source', regionId: 2 }, 100, abs)).toBe(4177.2);
        expect(resolveDraftAbs({ kind: 'source', regionId: 999 }, 100, abs)).toBe(100);
        expect(resolveDraftAbs({ kind: 'manual', abs: '555' }, 100, abs)).toBe(555);
        expect(resolveDraftAbs({ kind: 'manual', abs: 'abc' }, 100, abs)).toBe(100);
        expect(resolveDraftAbs({ kind: 'none' }, 100, abs)).toBe(100);
    });
});

describe('черновик → запрос', () => {
    it('своя цена передаётся только когда её правили', () => {
        let changes = applyToggle(empty(), server(), 2, true);
        changes = applyOwnAbs(changes, 1, '7000');
        changes = applyOwnSource(changes, 3, 1);

        const items = toBulkItems(changes);
        const plain = items.find(item => item.regionId === 2);

        expect(plain).toEqual({ regionId: 2, enabled: true });
        expect('ownAbs' in (plain ?? {})).toBe(false);
        expect('ownAbsRegionId' in (plain ?? {})).toBe(false);
        expect(items.find(item => item.regionId === 1)).toEqual({
            regionId: 1,
            enabled: true,
            ownAbs: '7000',
        });
        expect(items.find(item => item.regionId === 3)).toEqual({
            regionId: 3,
            enabled: true,
            ownAbsRegionId: 1,
        });
    });

    it('сброс уходит явным null', () => {
        expect(toBulkItems(applyOwnAbs(empty(), 1, null))).toEqual([
            { regionId: 1, enabled: true, ownAbs: null },
        ]);
        expect(toBulkItems(applyOwnSource(empty(), 1, null))).toEqual([
            { regionId: 1, enabled: true, ownAbsRegionId: null },
        ]);
    });

    it('пустой черновик даёт пустой список', () => {
        expect(toBulkItems(empty())).toEqual([]);
    });
});

describe('ввод рабса', () => {
    it('запятая становится точкой, пустой ввод — сбросом', () => {
        expect(normalizeOwnAbsInput('4177,20')).toBe('4177.20');
        expect(normalizeOwnAbsInput('  5000 ')).toBe('5000');
        expect(normalizeOwnAbsInput('   ')).toBeNull();
    });

    it('рабс должен быть числом больше нуля и влезать в колонку', () => {
        expect(isValidOwnAbs('4177.20')).toBe(true);
        expect(isValidOwnAbs('abc')).toBe(false);
        expect(isValidOwnAbs('0')).toBe(false);
        expect(isValidOwnAbs('-5')).toBe(false);
        expect(isValidOwnAbs('1000000')).toBe(false);
    });

    it('считает только строки с неверным ручным рабсом', () => {
        let changes = applyOwnAbs(empty(), 1, 'abc');
        changes = applyOwnAbs(changes, 3, '5000');
        changes = applyOwnAbs(changes, 2, null);
        changes = applyOwnSource(changes, 4, 1);

        expect(countInvalidOwnAbs(changes)).toBe(1);
    });
});

describe('строка таблицы', () => {
    const abs = new Map([
        [1, 3000],
        [2, 3500],
        [3, 3100],
        [4, 3200],
    ]);

    it('без правок: рабс из своей цены на сервере', () => {
        expect(regionRowState(empty(), server(), abs, 3)).toEqual({
            enabled: true,
            isPending: false,
            view: { kind: 'manual', abs: '5000' },
            effectiveAbs: 5000,
            isAbsInvalid: false,
        });
        expect(regionRowState(empty(), server(), abs, 4).effectiveAbs).toBe(3000);
    });

    it('черновик сразу меняет действующий рабс', () => {
        const row = regionRowState(applyOwnSource(empty(), 1, 2), server(), abs, 1);

        expect(row.isPending).toBe(true);
        expect(row.effectiveAbs).toBe(3500);
    });

    it('неверный ввод помечается, рабс остаётся общим', () => {
        const row = regionRowState(applyOwnAbs(empty(), 1, 'abc'), server(), abs, 1);

        expect(row.isAbsInvalid).toBe(true);
        expect(row.effectiveAbs).toBe(3000);
    });

    it('выключенный регион считается по общему рабсу', () => {
        const off = applyToggle(empty(), server(), 3, false);

        expect(regionRowState(off, server(), abs, 3).effectiveAbs).toBe(3100);
    });
});
