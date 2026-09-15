import { describe, expect, it } from 'vitest';
import type { ComplectVariantRecordDto } from '../model/dto';
import { isSingleContractAllowed } from '../model/dto';
import { getVariantContractCode, selectParticipants } from './participants';
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

describe('участники сборки', () => {
    const withStages =
        (stages: Record<number, ComplectVariantStage>) =>
        (id: number | null) =>
            stages[Number(id)] ?? COMPLECT_VARIANT_STAGE.draft;

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
        expect(participants.map(item => item.variantSmartId)).toEqual([1]);
    });

    it('есть текущие — участвуют только они', () => {
        const participants = selectParticipants(
            [record(1), record(2), record(3)],
            withStages({ 2: COMPLECT_VARIANT_STAGE.current }),
        );
        expect(participants.map(item => item.variantSmartId)).toEqual([2]);
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
