import { describe, expect, it } from 'vitest';
import type { ComplectVariantRecordDto } from '../model/dto';
import { isSingleContractAllowed } from '../model/dto';
import {
    canMakeVariantCurrent,
    getVariantContractCode,
    selectParticipants,
} from './participants';
import { COMPLECT_VARIANT_STAGE, type ComplectVariantStage } from './stage';

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

describe('участники сборки', () => {
    it('стадий никто не трогал — участвуют все', () => {
        expect(
            selectParticipants([record(1), record(2)], withStages({})),
        ).toHaveLength(2);
    });

    it('отклонённые не участвуют', () => {
        const participants = selectParticipants(
            [record(1), record(2)],
            withStages({ 2: COMPLECT_VARIANT_STAGE.rejected }),
        );
        expect(idsOf(participants)).toEqual([1]);
    });

    it('есть текущие — участвуют только они', () => {
        const participants = selectParticipants(
            [record(1), record(2), record(3)],
            withStages({ 2: COMPLECT_VARIANT_STAGE.current }),
        );
        expect(idsOf(participants)).toEqual([2]);
    });

    it('черновик рядом с вариантом в стадии «КП» — участвует только «КП»', () => {
        const participants = selectParticipants(
            [record(1), record(2)],
            withStages({ 2: COMPLECT_VARIANT_STAGE.offer }),
        );
        expect(idsOf(participants)).toEqual([2]);
    });

    it('«Текущий» и «Поставка» участвуют вместе, черновик остаётся за бортом', () => {
        const participants = selectParticipants(
            [record(1), record(2), record(3)],
            withStages({
                1: COMPLECT_VARIANT_STAGE.current,
                2: COMPLECT_VARIANT_STAGE.supply,
            }),
        );
        expect(idsOf(participants)).toEqual([1, 2]);
    });

    it.each([
        COMPLECT_VARIANT_STAGE.current,
        COMPLECT_VARIANT_STAGE.offer,
        COMPLECT_VARIANT_STAGE.invoice,
        COMPLECT_VARIANT_STAGE.contract,
        COMPLECT_VARIANT_STAGE.supply,
        COMPLECT_VARIANT_STAGE.approval,
    ])('стадия %s отмечает вариант в работу', stage => {
        const participants = selectParticipants(
            [record(1), record(2)],
            withStages({ 1: stage }),
        );
        expect(idsOf(participants)).toEqual([1]);
    });

    it('«Успех» и «Не состоялся» не участвуют', () => {
        const participants = selectParticipants(
            [record(1), record(2), record(3)],
            withStages({
                1: COMPLECT_VARIANT_STAGE.success,
                2: COMPLECT_VARIANT_STAGE.failed,
            }),
        );
        expect(idsOf(participants)).toEqual([3]);
    });

    it('закрытый вариант выпадает и рядом с вариантом в работе', () => {
        const participants = selectParticipants(
            [record(1), record(2), record(3)],
            withStages({
                1: COMPLECT_VARIANT_STAGE.success,
                2: COMPLECT_VARIANT_STAGE.offer,
            }),
        );
        expect(idsOf(participants)).toEqual([2]);
    });

    it('одни черновики и «В мердже» — участвуют все', () => {
        const participants = selectParticipants(
            [record(1), record(2), record(3)],
            withStages({ 3: COMPLECT_VARIANT_STAGE.merged }),
        );
        expect(idsOf(participants)).toEqual([1, 2, 3]);
    });

    it('все варианты закрыты — участников нет', () => {
        const participants = selectParticipants(
            [record(1), record(2), record(3)],
            withStages({
                1: COMPLECT_VARIANT_STAGE.success,
                2: COMPLECT_VARIANT_STAGE.rejected,
                3: COMPLECT_VARIANT_STAGE.failed,
            }),
        );
        expect(participants).toEqual([]);
    });
});

describe('«Сделать текущим»', () => {
    it('единственный вариант уже участвует — действие не нужно', () => {
        expect(canMakeVariantCurrent([record(1)], withStages({}), 1)).toBe(false);
    });

    it('единственный отклонённый вариант возвращается в работу', () => {
        const stages = withStages({ 1: COMPLECT_VARIANT_STAGE.rejected });
        expect(canMakeVariantCurrent([record(1)], stages, 1)).toBe(true);
    });

    it('текущий вариант уже текущий', () => {
        const stages = withStages({ 1: COMPLECT_VARIANT_STAGE.current });
        expect(canMakeVariantCurrent([record(1), record(2)], stages, 1)).toBe(false);
    });

    it('несколько вариантов без текущих — выбор сужает состав участников', () => {
        expect(
            canMakeVariantCurrent([record(1), record(2)], withStages({}), 1),
        ).toBe(true);
    });

    it('остальные отклонены — вариант и так единственный участник', () => {
        const stages = withStages({ 2: COMPLECT_VARIANT_STAGE.rejected });
        expect(canMakeVariantCurrent([record(1), record(2)], stages, 1)).toBe(false);
        expect(canMakeVariantCurrent([record(1), record(2)], stages, 2)).toBe(true);
    });

    it('при другом текущем вариант попадает в участники', () => {
        const stages = withStages({ 1: COMPLECT_VARIANT_STAGE.current });
        expect(canMakeVariantCurrent([record(1), record(2)], stages, 2)).toBe(true);
    });

    it('черновик рядом с вариантом в стадии «КП» можно сделать текущим', () => {
        const stages = withStages({ 2: COMPLECT_VARIANT_STAGE.offer });
        expect(canMakeVariantCurrent([record(1), record(2)], stages, 1)).toBe(true);
    });

    it('вариант в стадии «КП» уже участвует — действие не нужно', () => {
        const stages = withStages({ 2: COMPLECT_VARIANT_STAGE.offer });
        expect(canMakeVariantCurrent([record(1), record(2)], stages, 2)).toBe(false);
    });

    it('вариант в стадии «Успех» закрыт бэком — действия нет', () => {
        const stages = withStages({ 1: COMPLECT_VARIANT_STAGE.success });
        expect(canMakeVariantCurrent([record(1), record(2)], stages, 1)).toBe(false);
        expect(canMakeVariantCurrent([record(1)], stages, 1)).toBe(false);
    });

    it('вариант в стадии «Не состоялся» закрыт бэком — действия нет', () => {
        const stages = withStages({ 1: COMPLECT_VARIANT_STAGE.failed });
        expect(canMakeVariantCurrent([record(1), record(2)], stages, 1)).toBe(false);
        expect(canMakeVariantCurrent([record(1)], stages, 1)).toBe(false);
    });

    it('отклонённый вариант рядом с вариантом в работе возвращается в участники', () => {
        const stages = withStages({
            1: COMPLECT_VARIANT_STAGE.rejected,
            2: COMPLECT_VARIANT_STAGE.offer,
        });
        expect(canMakeVariantCurrent([record(1), record(2)], stages, 1)).toBe(true);
    });

    it('у записи без элемента смарта действия нет', () => {
        expect(canMakeVariantCurrent([record(1)], withStages({}), null)).toBe(false);
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
