import { describe, expect, it } from 'vitest';
import type { ComplectVariantRecordDto } from '../model/dto';
import { COMPLECT_MODE, isSingleContractAllowed } from '../model/dto';
import {
    getVariantContractCode,
    selectParticipants,
    selectUnclosedVariants,
} from './participants';
import {
    COMPLECT_VARIANT_FINAL_STAGES,
    COMPLECT_VARIANT_STAGE,
    isFinalVariantStage,
    type ComplectVariantStage,
} from './stage';

const record = (
    variantSmartId: number,
    over: Partial<ComplectVariantRecordDto> = {},
): ComplectVariantRecordDto =>
    ({
        id: variantSmartId,
        variantSmartId,
        rows: null,
        contract: null,
        ...over,
    }) as ComplectVariantRecordDto;

/** Стадии по variantSmartId; без записи в карте вариант остаётся черновиком. */
const withStages =
    (stages: Record<number, ComplectVariantStage>) => (id: number | null) =>
        stages[Number(id)] ?? COMPLECT_VARIANT_STAGE.draft;

const idsOf = (items: ReadonlyArray<{ variantSmartId: number | null }>) =>
    items.map(item => item.variantSmartId);

const NON_FINAL_STAGES = Object.values(COMPLECT_VARIANT_STAGE).filter(
    stage => !isFinalVariantStage(stage),
);

describe('участники документов в режиме «по одному»', () => {
    const mode = COMPLECT_MODE.compare;

    it('открытый вариант — единственный участник, остальные не участвуют', () => {
        const participants = selectParticipants(
            [record(1), record(2), record(3)],
            withStages({ 1: COMPLECT_VARIANT_STAGE.current, 3: COMPLECT_VARIANT_STAGE.offer }),
            mode,
            2,
        );
        expect(idsOf(participants)).toEqual([2]);
    });

    it('открытого варианта нет — участников нет, документы идут по живому состоянию', () => {
        const participants = selectParticipants(
            [record(1), record(2)],
            withStages({ 1: COMPLECT_VARIANT_STAGE.current }),
            mode,
            null,
        );
        expect(participants).toEqual([]);
    });

    it.each(COMPLECT_VARIANT_FINAL_STAGES)('открытый вариант закрыт (%s) — участников нет', stage => {
        const participants = selectParticipants([record(1), record(2)], withStages({ 1: stage }), mode, 1);
        expect(participants).toEqual([]);
    });

    it.each(NON_FINAL_STAGES)('служебная стадия %s участию открытого варианта не мешает', stage => {
        const participants = selectParticipants([record(1), record(2)], withStages({ 1: stage }), mode, 1);
        expect(idsOf(participants)).toEqual([1]);
    });

    it('указатель на вариант, которого нет в списке, участников не даёт', () => {
        expect(selectParticipants([record(1), record(2)], withStages({}), mode, 99)).toEqual([]);
    });
});

describe.each([COMPLECT_MODE.multi_contract, COMPLECT_MODE.single_contract])(
    'участники документов в режиме «вместе» (%s)',
    mode => {
        it('участвуют все незакрытые варианты, черновики тоже', () => {
            const participants = selectParticipants([record(1), record(2), record(3)], withStages({}), mode, null);
            expect(idsOf(participants)).toEqual([1, 2, 3]);
        });

        it.each(NON_FINAL_STAGES)('стадия %s состав не сужает', stage => {
            const participants = selectParticipants(
                [record(1), record(2), record(3)],
                withStages({ 2: stage }),
                mode,
                null,
            );
            expect(idsOf(participants)).toEqual([1, 2, 3]);
        });

        it.each(COMPLECT_VARIANT_FINAL_STAGES)('вариант в стадии %s не участвует', stage => {
            const participants = selectParticipants(
                [record(1), record(2), record(3)],
                withStages({ 2: stage }),
                mode,
                null,
            );
            expect(idsOf(participants)).toEqual([1, 3]);
        });

        it('закрытые выпадают, остальные остаются в порядке записей', () => {
            const participants = selectParticipants(
                [record(1), record(2), record(3), record(4)],
                withStages({
                    1: COMPLECT_VARIANT_STAGE.success,
                    2: COMPLECT_VARIANT_STAGE.offer,
                    4: COMPLECT_VARIANT_STAGE.failed,
                }),
                mode,
                null,
            );
            expect(idsOf(participants)).toEqual([2, 3]);
        });

        it('открытый вариант на состав не влияет', () => {
            const variants = [record(1), record(2)];
            expect(idsOf(selectParticipants(variants, withStages({}), mode, 1))).toEqual([1, 2]);
            expect(idsOf(selectParticipants(variants, withStages({}), mode, null))).toEqual([1, 2]);
        });

        it('все варианты закрыты — участников нет', () => {
            const participants = selectParticipants(
                [record(1), record(2), record(3)],
                withStages({
                    1: COMPLECT_VARIANT_STAGE.success,
                    2: COMPLECT_VARIANT_STAGE.rejected,
                    3: COMPLECT_VARIANT_STAGE.failed,
                }),
                mode,
                null,
            );
            expect(participants).toEqual([]);
        });
    },
);

describe('незакрытые варианты', () => {
    it('закрытые выпадают независимо от режима и открытого варианта', () => {
        const stages = withStages({ 2: COMPLECT_VARIANT_STAGE.rejected });
        expect(idsOf(selectUnclosedVariants([record(1), record(2), record(3)], stages))).toEqual([1, 3]);
    });
});

describe('тип договора варианта', () => {
    it('слепок v2 — из contractCode', () => {
        const v2 = JSON.stringify({ schemaVersion: 2, contractCode: 'abonYear' });
        expect(getVariantContractCode(record(1, { rows: v2 }))).toBe('abonYear');
    });

    it('легаси v1 — из колонки contract', () => {
        expect(
            getVariantContractCode(
                record(1, {
                    rows: JSON.stringify({ sets: {} }),
                    contract: JSON.stringify({ current: { code: 'licYear' } }),
                }),
            ),
        ).toBe('licYear');
    });

    it('битая или пустая запись не роняет экран', () => {
        expect(getVariantContractCode(record(1))).toBe('');
        expect(getVariantContractCode(record(1, { contract: '{не json' }))).toBe(
            '',
        );
    });
});

describe('один договор на несколько наборов', () => {
    it('разрешён только при одинаковом читаемом типе', () => {
        expect(isSingleContractAllowed(['abonYear', 'abonYear'])).toBe(true);
        expect(isSingleContractAllowed(['abonYear', 'licYear'])).toBe(false);
        // тип не прочитался — объединять вслепую нельзя
        expect(isSingleContractAllowed(['abonYear', ''])).toBe(false);
        expect(isSingleContractAllowed([])).toBe(false);
    });
});
