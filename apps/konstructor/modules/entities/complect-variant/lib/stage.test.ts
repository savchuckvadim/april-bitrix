import { describe, expect, it } from 'vitest';
import {
    buildVariantStageId,
    COMPLECT_VARIANT_STAGE,
    COMPLECT_VARIANT_STAGE_TITLE,
    isActiveVariantStage,
    isFinalVariantStage,
    resolveVariantStage,
    type ComplectVariantStage,
} from './stage';
import { COMPLECT_VARIANT_STAGE_TONE } from './stage-tone';

/**
 * Стадия элемента — единственный след выбора менеджера. Формат STATUS_ID
 * задаёт установщик смарта на бэке: `DT{entityTypeId}_{catId}:{SUFFIX}`.
 */
const ALL_STAGES: ReadonlyArray<{
    suffix: string;
    stage: ComplectVariantStage;
    title: string;
}> = [
    { suffix: 'DRAFT', stage: COMPLECT_VARIANT_STAGE.draft, title: 'Черновик' },
    { suffix: 'CURRENT', stage: COMPLECT_VARIANT_STAGE.current, title: 'Текущий' },
    { suffix: 'MERGED', stage: COMPLECT_VARIANT_STAGE.merged, title: 'В мердже' },
    { suffix: 'OFFER', stage: COMPLECT_VARIANT_STAGE.offer, title: 'КП' },
    { suffix: 'INVOICE', stage: COMPLECT_VARIANT_STAGE.invoice, title: 'Счёт' },
    { suffix: 'CONTRACT', stage: COMPLECT_VARIANT_STAGE.contract, title: 'Договор' },
    { suffix: 'SUPPLY', stage: COMPLECT_VARIANT_STAGE.supply, title: 'Поставка' },
    {
        suffix: 'APPROVAL',
        stage: COMPLECT_VARIANT_STAGE.approval,
        title: 'Согласование',
    },
    { suffix: 'SUCCESS', stage: COMPLECT_VARIANT_STAGE.success, title: 'Успех' },
    { suffix: 'REJECTED', stage: COMPLECT_VARIANT_STAGE.rejected, title: 'Отклонён' },
    { suffix: 'FAILED', stage: COMPLECT_VARIANT_STAGE.failed, title: 'Не состоялся' },
];

describe('стадия варианта', () => {
    it('фронт знает все одиннадцать стадий бэка', () => {
        expect(Object.values(COMPLECT_VARIANT_STAGE)).toHaveLength(11);
        expect(Object.values(COMPLECT_VARIANT_STAGE).sort()).toEqual(
            ALL_STAGES.map(item => item.stage).sort(),
        );
    });

    it.each(ALL_STAGES)('читает $suffix как $stage', ({ suffix, stage }) => {
        expect(resolveVariantStage(`DT1046_1:${suffix}`)).toBe(stage);
    });

    it('суффикс читается без учёта регистра', () => {
        expect(resolveVariantStage('DT1046_1:offer')).toBe(
            COMPLECT_VARIANT_STAGE.offer,
        );
    });

    it('чужая или пустая стадия считается черновиком', () => {
        expect(resolveVariantStage('DT999_1:WHATEVER')).toBe(
            COMPLECT_VARIANT_STAGE.draft,
        );
        expect(resolveVariantStage(null)).toBe(COMPLECT_VARIANT_STAGE.draft);
        expect(resolveVariantStage(undefined)).toBe(COMPLECT_VARIANT_STAGE.draft);
        expect(resolveVariantStage('')).toBe(COMPLECT_VARIANT_STAGE.draft);
    });

    it.each(ALL_STAGES)(
        'новая стадия $stage строится в той же воронке',
        ({ suffix, stage }) => {
            expect(buildVariantStageId('DT1046_7:DRAFT', stage)).toBe(
                `DT1046_7:${suffix}`,
            );
        },
    );

    it('stageId без категории — стадия не строится', () => {
        expect(buildVariantStageId('', COMPLECT_VARIANT_STAGE.current)).toBeNull();
        expect(
            buildVariantStageId('МУСОР', COMPLECT_VARIANT_STAGE.current),
        ).toBeNull();
    });
});

describe('подписи и тона стадий', () => {
    it.each(ALL_STAGES)('у $stage подпись «$title»', ({ stage, title }) => {
        expect(COMPLECT_VARIANT_STAGE_TITLE[stage]).toBe(title);
    });

    it('тона бейджа: черновик приглушён, Текущий и Успех зелёные', () => {
        expect(COMPLECT_VARIANT_STAGE_TONE[COMPLECT_VARIANT_STAGE.draft]).toBe('muted');
        expect(COMPLECT_VARIANT_STAGE_TONE[COMPLECT_VARIANT_STAGE.current]).toBe(
            'success',
        );
        expect(COMPLECT_VARIANT_STAGE_TONE[COMPLECT_VARIANT_STAGE.success]).toBe(
            'success',
        );
    });

    it('тона бейджа: рабочие стадии информационные, закрытые отказом красные', () => {
        const infoStages = [
            COMPLECT_VARIANT_STAGE.merged,
            COMPLECT_VARIANT_STAGE.offer,
            COMPLECT_VARIANT_STAGE.invoice,
            COMPLECT_VARIANT_STAGE.contract,
            COMPLECT_VARIANT_STAGE.supply,
            COMPLECT_VARIANT_STAGE.approval,
        ];
        for (const stage of infoStages) {
            expect(COMPLECT_VARIANT_STAGE_TONE[stage]).toBe('info');
        }
        expect(COMPLECT_VARIANT_STAGE_TONE[COMPLECT_VARIANT_STAGE.rejected]).toBe(
            'destructive',
        );
        expect(COMPLECT_VARIANT_STAGE_TONE[COMPLECT_VARIANT_STAGE.failed]).toBe(
            'destructive',
        );
    });
});

describe('финальные стадии и «в работе»', () => {
    const finals = [
        COMPLECT_VARIANT_STAGE.success,
        COMPLECT_VARIANT_STAGE.rejected,
        COMPLECT_VARIANT_STAGE.failed,
    ];
    const actives = [
        COMPLECT_VARIANT_STAGE.current,
        COMPLECT_VARIANT_STAGE.offer,
        COMPLECT_VARIANT_STAGE.invoice,
        COMPLECT_VARIANT_STAGE.contract,
        COMPLECT_VARIANT_STAGE.supply,
        COMPLECT_VARIANT_STAGE.approval,
    ];

    it('финальные: Успех, Отклонён, Не состоялся', () => {
        const found = ALL_STAGES.map(item => item.stage).filter(isFinalVariantStage);
        expect(found.sort()).toEqual([...finals].sort());
    });

    it('в работе: Текущий, КП, Счёт, Договор, Поставка, Согласование', () => {
        const found = ALL_STAGES.map(item => item.stage).filter(isActiveVariantStage);
        expect(found.sort()).toEqual([...actives].sort());
    });

    it('черновик и «В мердже» относятся к открытым без отметки в работу', () => {
        for (const stage of [
            COMPLECT_VARIANT_STAGE.draft,
            COMPLECT_VARIANT_STAGE.merged,
        ]) {
            expect(isFinalVariantStage(stage)).toBe(false);
            expect(isActiveVariantStage(stage)).toBe(false);
        }
    });
});
