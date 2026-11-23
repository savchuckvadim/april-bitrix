import { describe, expect, it } from 'vitest';
import {
    buildVariantStageId,
    COMPLECT_VARIANT_STAGE,
    COMPLECT_VARIANT_STAGE_TITLE,
    canRejectVariant,
    canRestoreVariant,
    isFinalVariantStage,
    resolveVariantStage,
    type ComplectVariantStage,
} from './stage';
import { COMPLECT_VARIANT_STAGE_TONE } from './stage-tone';

/**
 * Стадия элемента — служебная пометка хода работы над вариантом. Формат
 * STATUS_ID задаёт установщик смарта на бэке: `DT{entityTypeId}_{catId}:{SUFFIX}`.
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

describe('финальные стадии', () => {
    const finals = [
        COMPLECT_VARIANT_STAGE.success,
        COMPLECT_VARIANT_STAGE.rejected,
        COMPLECT_VARIANT_STAGE.failed,
    ];

    it('финальные: Успех, Отклонён, Не состоялся', () => {
        const found = ALL_STAGES.map(item => item.stage).filter(isFinalVariantStage);
        expect(found.sort()).toEqual([...finals].sort());
    });

    it('остальные восемь стадий не закрывают вариант', () => {
        const unclosed = ALL_STAGES.map(item => item.stage).filter(stage => !isFinalVariantStage(stage));
        expect(unclosed).toHaveLength(8);
    });
});

describe('кнопки «Отклонить» и «Вернуть»', () => {
    it('«Отклонить» есть у любого незакрытого варианта', () => {
        const rejectable = ALL_STAGES.map(item => item.stage).filter(canRejectVariant);
        expect(rejectable).toHaveLength(8);
        expect(rejectable).not.toContain(COMPLECT_VARIANT_STAGE.rejected);
    });

    it('«Вернуть» есть только у отклонённого варианта', () => {
        const restorable = ALL_STAGES.map(item => item.stage).filter(canRestoreVariant);
        expect(restorable).toEqual([COMPLECT_VARIANT_STAGE.rejected]);
    });

    it('закрытые Успех и «Не состоялся» не отклоняются и не возвращаются', () => {
        for (const stage of [COMPLECT_VARIANT_STAGE.success, COMPLECT_VARIANT_STAGE.failed]) {
            expect(canRejectVariant(stage)).toBe(false);
            expect(canRestoreVariant(stage)).toBe(false);
        }
    });
});
