/**
 * Стадия элемента смарта — признак участия варианта в сделке.
 *
 * Почему стадия, а не поле: её видно колонкой канбана прямо в Битриксе,
 * менеджер двигает карточку мышкой, она переживает перезагрузку конструктора и
 * переезжает вместе с вариантом в сервисную сделку. Коды и суффиксы совпадают
 * с бэком (`libs/portal-lib/pbx/pbx-complect-variant-smart`): STATUS_ID
 * элемента имеет вид `DT{entityTypeId}_{categoryId}:{SUFFIX}`.
 */

export const COMPLECT_VARIANT_STAGE = {
    draft: 'cvar_draft',
    current: 'cvar_current',
    merged: 'cvar_merged',
    rejected: 'cvar_rejected',
} as const;

export type ComplectVariantStage =
    (typeof COMPLECT_VARIANT_STAGE)[keyof typeof COMPLECT_VARIANT_STAGE];

export const COMPLECT_VARIANT_STAGE_TITLE: Record<ComplectVariantStage, string> =
    {
        [COMPLECT_VARIANT_STAGE.draft]: 'Черновик',
        [COMPLECT_VARIANT_STAGE.current]: 'Текущий',
        [COMPLECT_VARIANT_STAGE.merged]: 'В мердже',
        [COMPLECT_VARIANT_STAGE.rejected]: 'Отклонён',
    };

/** Суффикс STATUS_ID: `cvar_current` → `CURRENT`. */
const stageSuffix = (stage: ComplectVariantStage): string =>
    stage.replace(/^cvar_/, '').toUpperCase();

/** Код стадии по stageId элемента. Чужая или пустая стадия — черновик. */
export const resolveVariantStage = (
    stageId: string | null | undefined,
): ComplectVariantStage => {
    const suffix = (stageId ?? '').split(':').pop()?.toUpperCase();
    if (!suffix) return COMPLECT_VARIANT_STAGE.draft;
    const found = Object.values(COMPLECT_VARIANT_STAGE).find(
        stage => stageSuffix(stage) === suffix,
    );
    return found ?? COMPLECT_VARIANT_STAGE.draft;
};

/**
 * stageId той же воронки, но другой стадии. Категорию берём из текущего
 * stageId элемента: у смарта их может быть несколько, и угадывать нельзя.
 */
export const buildVariantStageId = (
    currentStageId: string | null | undefined,
    stage: ComplectVariantStage,
): string | null => {
    if (!currentStageId || !currentStageId.includes(':')) return null;
    return currentStageId.replace(/:[^:]*$/, `:${stageSuffix(stage)}`);
};
