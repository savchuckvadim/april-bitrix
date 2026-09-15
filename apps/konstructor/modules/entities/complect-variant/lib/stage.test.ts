import { describe, expect, it } from 'vitest';
import {
    buildVariantStageId,
    COMPLECT_VARIANT_STAGE,
    resolveVariantStage,
} from './stage';

/**
 * Стадия элемента — единственный след выбора менеджера. Формат STATUS_ID
 * задаёт установщик смарта на бэке: `DT{entityTypeId}_{catId}:{SUFFIX}`.
 */
describe('стадия варианта', () => {
    it('читает код стадии из stageId', () => {
        expect(resolveVariantStage('DT1046_1:CURRENT')).toBe(
            COMPLECT_VARIANT_STAGE.current,
        );
        expect(resolveVariantStage('DT1046_1:REJECTED')).toBe(
            COMPLECT_VARIANT_STAGE.rejected,
        );
    });

    it('чужая или пустая стадия считается черновиком', () => {
        expect(resolveVariantStage('DT999_1:WHATEVER')).toBe(
            COMPLECT_VARIANT_STAGE.draft,
        );
        expect(resolveVariantStage(null)).toBe(COMPLECT_VARIANT_STAGE.draft);
        expect(resolveVariantStage('')).toBe(COMPLECT_VARIANT_STAGE.draft);
    });

    it('новая стадия строится в той же воронке', () => {
        expect(
            buildVariantStageId('DT1046_7:DRAFT', COMPLECT_VARIANT_STAGE.current),
        ).toBe('DT1046_7:CURRENT');
    });

    it('stageId без категории — стадию не строим, а не угадываем', () => {
        expect(buildVariantStageId('', COMPLECT_VARIANT_STAGE.current)).toBeNull();
        expect(
            buildVariantStageId('МУСОР', COMPLECT_VARIANT_STAGE.current),
        ).toBeNull();
    });
});
