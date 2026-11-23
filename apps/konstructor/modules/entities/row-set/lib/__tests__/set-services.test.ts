import { describe, expect, it } from 'vitest';
import oldInit from '../../../catalog/lib/__fixtures__/oldinit.json';
import { catalogFromOldInit } from '../../../catalog';
import { defaultComposition, type Composition } from '../../../composition';
import type { KRow, RowSet } from '../../model/types';
import { buildGarantRow } from '../row';
import {
    createSet,
    garantRows,
    mergedSetComposition,
    paidLtOwner,
    paidLtPacket,
    planServiceFieldWrite,
    planStarRemoval,
    setServiceValues,
    syncSetWithComposition,
    upsertRow,
    type RowCompositionWrite,
} from '../set';

/**
 * Сервисные значения набора (консалтинг, академия, СТАР, платный LT) читаются
 * из объединённого наполнения всех строк Гаранта, а запись выравнивает наполнения
 * так, чтобы объединённое значение стало ровно выбранным.
 */
const catalog = catalogFromOldInit(oldInit);
const buh = catalog.complects.byCode['buh']!;
const context = { regionCode: 'stv', withTax: false };

/** Чистое наполнение без консалтинга, СТАР, академии и платного LT */
const bare = (patch: Partial<Composition> = {}): Composition => ({
    ...defaultComposition(buh),
    consalting: null,
    star: false,
    academy: null,
    ltInPacket: [],
    ltOther: [],
    ...patch,
});

const garant = (key: string, composition?: Composition): KRow =>
    buildGarantRow({
        catalog,
        regionCode: 'stv',
        withTax: false,
        key,
        setId: 'general',
        role: key === 'lead' ? 'main' : 'additional',
        complectCode: 'buh',
        supplyCode: 'internet_1',
        contractCode: 'internet',
        composition,
    })!;

const makeSet = (...rows: KRow[]): RowSet =>
    rows.reduce((set, row) => upsertRow(set, row), createSet('general', 'general'));

/** Применить план так же, как это делает setRowComposition */
const applyWrites = (set: RowSet, plan: RowCompositionWrite[]): RowSet => ({
    ...set,
    rows: set.rows.map(row => {
        const write = plan.find(item => item.key === row.key);
        return write ? { ...row, composition: write.composition } : row;
    }),
});

const keysOf = (plan: RowCompositionWrite[]): string[] => plan.map(write => write.key);

const compositionOf = (set: RowSet, key: string): Composition | undefined =>
    set.rows.find(row => row.key === key)?.composition;

describe('объединённое наполнение набора', () => {
    it('строки без наполнения пропускаются', () => {
        const set = makeSet(garant('lead'), garant('extra', bare({ consalting: 'sovex' })));
        expect(mergedSetComposition(set)?.consalting).toBe('sovex');
    });

    it('наполнений нет ни у одной строки — null и значения по умолчанию', () => {
        const set = makeSet(garant('lead'), garant('extra'));
        expect(mergedSetComposition(set)).toBeNull();
        expect(setServiceValues(set)).toEqual({ consalting: null, academy: null, star: false });
    });
});

describe('чтение сервисных значений по набору из двух Гарантов', () => {
    it('консалтинг только у дополнительной строки: текущее значение равно ему', () => {
        const set = makeSet(garant('lead', bare()), garant('extra', bare({ consalting: 'sovex' })));
        expect(setServiceValues(set).consalting).toBe('sovex');
    });

    it('консалтинг у обеих строк: побеждает pkpremium', () => {
        const set = makeSet(
            garant('lead', bare({ consalting: 'sovex' })),
            garant('extra', bare({ consalting: 'pkpremium' })),
        );
        expect(setServiceValues(set).consalting).toBe('pkpremium');
    });

    it('академия только у дополнительной строки: текущее значение равно ей', () => {
        const set = makeSet(garant('lead', bare()), garant('extra', bare({ academy: 'academy_15' })));
        expect(setServiceValues(set).academy).toBe('academy_15');
    });

    it('академия у обеих строк: первая непустая по порядку', () => {
        const set = makeSet(
            garant('lead', bare({ academy: 'academy_2' })),
            garant('extra', bare({ academy: 'academy_15' })),
        );
        expect(setServiceValues(set).academy).toBe('academy_2');
    });

    it('СТАР только у дополнительной строки: признак стоит', () => {
        const set = makeSet(garant('lead', bare()), garant('extra', bare({ star: true })));
        expect(setServiceValues(set).star).toBe(true);
    });
});

describe('план записи консалтинга и академии', () => {
    it('новое значение получает ведущая строка, у дополнительной поле сбрасывается', () => {
        const set = makeSet(garant('lead', bare()), garant('extra', bare({ consalting: 'sovex' })));
        const plan = planServiceFieldWrite(set, 'consalting', 'pkpremium');
        expect(keysOf(plan)).toEqual(['lead', 'extra']);
        expect(plan[0]!.composition.consalting).toBe('pkpremium');
        expect(plan[1]!.composition.consalting).toBeNull();
        expect(setServiceValues(applyWrites(set, plan)).consalting).toBe('pkpremium');
    });

    it('строка без изменений в план не попадает', () => {
        const set = makeSet(garant('lead', bare({ consalting: 'sovex' })), garant('extra', bare()));
        expect(planServiceFieldWrite(set, 'consalting', 'sovex')).toEqual([]);
        // «Только Горячая линия»: ведущая сбрасывается, дополнительная уже пуста
        expect(keysOf(planServiceFieldWrite(set, 'consalting', null))).toEqual(['lead']);
    });

    it('ведущая уже хранит выбранное значение: сбрасывается только дополнительная', () => {
        const set = makeSet(
            garant('lead', bare({ consalting: 'sovex' })),
            garant('extra', bare({ consalting: 'pkpremium' })),
        );
        const plan = planServiceFieldWrite(set, 'consalting', 'sovex');
        expect(keysOf(plan)).toEqual(['extra']);
        expect(setServiceValues(applyWrites(set, plan)).consalting).toBe('sovex');
    });

    it('«Только Горячая линия» очищает консалтинг у всех строк', () => {
        const set = makeSet(
            garant('lead', bare({ consalting: 'sovex' })),
            garant('extra', bare({ consalting: 'pkpremium' })),
        );
        const plan = planServiceFieldWrite(set, 'consalting', null);
        expect(keysOf(plan)).toEqual(['lead', 'extra']);
        expect(setServiceValues(applyWrites(set, plan)).consalting).toBeNull();
    });

    it('академия: выбранный пакет у ведущей, у дополнительной сброс', () => {
        const set = makeSet(garant('lead', bare()), garant('extra', bare({ academy: 'academy_15' })));
        const plan = planServiceFieldWrite(set, 'academy', 'academy_2');
        expect(keysOf(plan)).toEqual(['lead', 'extra']);
        expect(plan[0]!.composition.academy).toBe('academy_2');
        expect(plan[1]!.composition.academy).toBeNull();
        expect(setServiceValues(applyWrites(set, plan)).academy).toBe('academy_2');
    });

    it('запись одного поля не задевает остальное наполнение строки', () => {
        const extra = bare({ consalting: 'sovex', star: true, academy: 'academy_15' });
        const set = makeSet(garant('lead', bare()), garant('extra', extra));
        const plan = planServiceFieldWrite(set, 'consalting', null);
        expect(plan[0]!.composition).toEqual({ ...extra, consalting: null });
    });

    it('у ведущей строки нет наполнения: план пуст', () => {
        const set = makeSet(garant('lead'), garant('extra', bare({ consalting: 'sovex' })));
        expect(planServiceFieldWrite(set, 'consalting', null)).toEqual([]);
    });
});

describe('план снятия СТАР', () => {
    it('СТАР у дополнительной строки входит в план', () => {
        const set = makeSet(garant('lead', bare()), garant('extra', bare({ star: true })));
        const plan = planStarRemoval(set);
        expect(keysOf(plan)).toEqual(['extra']);
        expect(plan[0]!.composition.star).toBe(false);
        expect(setServiceValues(applyWrites(set, plan)).star).toBe(false);
    });

    it('флаг снимается у всех строк, где он стоит', () => {
        const set = makeSet(garant('lead', bare({ star: true })), garant('extra', bare({ star: true })));
        expect(keysOf(planStarRemoval(set))).toEqual(['lead', 'extra']);
    });

    it('СТАР нигде нет: план пуст', () => {
        const set = makeSet(garant('lead', bare()), garant('extra', bare()));
        expect(planStarRemoval(set)).toEqual([]);
    });
});

describe('платный LT', () => {
    const paid = ['ltsut', 'ltdisk'];

    it('LT только в наполнении дополнительной строки: владелец она', () => {
        const set = makeSet(garant('lead', bare()), garant('extra', bare({ ltInPacket: paid })));
        expect(paidLtOwner(set)?.key).toBe('extra');
    });

    it('платный LT у обеих строк: владелец первая по порядку', () => {
        const set = makeSet(
            garant('lead', bare({ ltInPacket: ['ltsut'] })),
            garant('extra', bare({ ltInPacket: paid })),
        );
        expect(paidLtOwner(set)?.key).toBe('lead');
    });

    it('платного LT нет нигде: владелец ведущая строка', () => {
        const set = makeSet(garant('lead', bare()), garant('extra', bare()));
        expect(paidLtOwner(set)?.key).toBe('lead');
    });

    it('подпись пакета считается от объединённого наполнения', () => {
        const set = makeSet(
            garant('lead', bare({ ltInPacket: ['ltsut'] })),
            garant('extra', bare({ ltInPacket: ['ltdisk'] })),
        );
        const packet = paidLtPacket(set, { catalog });
        expect(packet?.services.map(item => item.code)).toEqual(['ltsut', 'ltdisk']);
        expect(packet?.weight).toBe(2);
        expect(packet?.package?.code).toBe('ltpackSmall');
    });

    it('пакет собран из наполнения дополнительной строки: данные для подписи есть', () => {
        const set = makeSet(garant('lead', bare()), garant('extra', bare({ ltInPacket: paid })));
        expect(paidLtPacket(set, { catalog })?.weight).toBe(2);
    });

    it('платного LT нет: пакета нет', () => {
        const set = makeSet(garant('lead', bare()), garant('extra', bare()));
        expect(paidLtPacket(set, { catalog })).toBeNull();
    });
});

describe('набор с одной строкой Гаранта', () => {
    it('значения равны наполнению строки', () => {
        const set = makeSet(
            garant('lead', bare({ consalting: 'sovex', academy: 'academy_15', star: true })),
        );
        expect(setServiceValues(set)).toEqual({ consalting: 'sovex', academy: 'academy_15', star: true });
    });

    it('план записи меняет только ведущую строку', () => {
        const set = makeSet(garant('lead', bare({ consalting: 'sovex' })));
        const plan = planServiceFieldWrite(set, 'consalting', 'pkpremium');
        expect(keysOf(plan)).toEqual(['lead']);
        expect(plan[0]!.composition).toEqual({ ...bare({ consalting: 'sovex' }), consalting: 'pkpremium' });
        expect(keysOf(planServiceFieldWrite(set, 'academy', 'academy_2'))).toEqual(['lead']);
    });

    it('снятие СТАР и владелец платного LT работают как раньше', () => {
        const set = makeSet(garant('lead', bare({ star: true, ltInPacket: ['ltsut', 'ltdisk'] })));
        expect(keysOf(planStarRemoval(set))).toEqual(['lead']);
        expect(paidLtOwner(set)?.key).toBe('lead');
        expect(paidLtPacket(set, { catalog })?.package?.code).toBe('ltpackSmall');
    });
});

describe('согласованность с пересборкой набора', () => {
    const rowOf = (set: RowSet, type: KRow['productType']) =>
        set.rows.find(row => row.productType === type) ?? null;

    it('консалтинг у дополнительной: строка есть, выбор «Горячая линия» её убирает', () => {
        const set = makeSet(garant('lead', bare()), garant('extra', bare({ consalting: 'sovex' })));
        const synced = syncSetWithComposition(set, catalog, context);
        expect(rowOf(synced, 'consalting')?.refs.serviceCode).toBe('sovex');
        expect(setServiceValues(synced).consalting).toBe('sovex');

        const cleared = applyWrites(synced, planServiceFieldWrite(synced, 'consalting', null));
        expect(rowOf(syncSetWithComposition(cleared, catalog, context), 'consalting')).toBeNull();
    });

    it('СТАР у дополнительной: после снятия строки СТАР нет', () => {
        const set = makeSet(garant('lead', bare()), garant('extra', bare({ star: true })));
        const synced = syncSetWithComposition(set, catalog, context);
        expect(rowOf(synced, 'star')).not.toBeNull();

        const cleared = applyWrites(synced, planStarRemoval(synced));
        expect(rowOf(syncSetWithComposition(cleared, catalog, context), 'star')).toBeNull();
        expect(garantRows(cleared).every(row => row.composition?.star === false)).toBe(true);
    });

    it('выбор консалтинга сохраняется в наполнении ведущей строки после пересборки', () => {
        const set = makeSet(garant('lead', bare()), garant('extra', bare({ consalting: 'sovex' })));
        const chosen = applyWrites(set, planServiceFieldWrite(set, 'consalting', 'pkpremium'));
        const synced = syncSetWithComposition(chosen, catalog, context);
        expect(rowOf(synced, 'consalting')?.refs.serviceCode).toBe('pkpremium');
        expect(compositionOf(synced, 'lead')?.consalting).toBe('pkpremium');
        expect(compositionOf(synced, 'extra')?.consalting).toBeNull();
    });
});
