/**
 * Стадия элемента смарта — признак участия варианта в сделке.
 *
 * Почему стадия, а не поле: её видно колонкой канбана прямо в Битриксе,
 * менеджер двигает карточку мышкой, она переживает перезагрузку конструктора и
 * переезжает вместе с вариантом в сервисную сделку. Коды и суффиксы совпадают
 * с бэком (`libs/portal-lib/pbx/pbx-complect-variant-smart`): STATUS_ID
 * элемента имеет вид `DT{entityTypeId}_{categoryId}:{SUFFIX}`.
 *
 * Порядок ключей — порядок стадий по sort на бэке. Часть стадий бэк ставит сам
 * (КП после формирования КП, Поставка после заявки поставки, Успех и «Не
 * состоялся» при переносе в сервисную сделку), часть пока никто не ставит
 * (задел), но фронт обязан узнавать любую.
 */

export const COMPLECT_VARIANT_STAGE = {
    draft: 'cvar_draft',
    current: 'cvar_current',
    merged: 'cvar_merged',
    offer: 'cvar_offer',
    invoice: 'cvar_invoice',
    contract: 'cvar_contract',
    supply: 'cvar_supply',
    approval: 'cvar_approval',
    success: 'cvar_success',
    rejected: 'cvar_rejected',
    failed: 'cvar_failed',
} as const;

export type ComplectVariantStage =
    (typeof COMPLECT_VARIANT_STAGE)[keyof typeof COMPLECT_VARIANT_STAGE];

export const COMPLECT_VARIANT_STAGE_TITLE: Record<ComplectVariantStage, string> =
    {
        [COMPLECT_VARIANT_STAGE.draft]: 'Черновик',
        [COMPLECT_VARIANT_STAGE.current]: 'Текущий',
        [COMPLECT_VARIANT_STAGE.merged]: 'В мердже',
        [COMPLECT_VARIANT_STAGE.offer]: 'КП',
        [COMPLECT_VARIANT_STAGE.invoice]: 'Счёт',
        [COMPLECT_VARIANT_STAGE.contract]: 'Договор',
        [COMPLECT_VARIANT_STAGE.supply]: 'Поставка',
        [COMPLECT_VARIANT_STAGE.approval]: 'Согласование',
        [COMPLECT_VARIANT_STAGE.success]: 'Успех',
        [COMPLECT_VARIANT_STAGE.rejected]: 'Отклонён',
        [COMPLECT_VARIANT_STAGE.failed]: 'Не состоялся',
    };

/**
 * Финальные стадии: итог по варианту подведён (Успех — уехал в сервисную
 * сделку, Отклонён — менеджер отказался, Не состоялся — вариант не выбрали).
 * Такой вариант ни в одном документе не участвует.
 */
export const COMPLECT_VARIANT_FINAL_STAGES: readonly ComplectVariantStage[] = [
    COMPLECT_VARIANT_STAGE.success,
    COMPLECT_VARIANT_STAGE.rejected,
    COMPLECT_VARIANT_STAGE.failed,
];

/**
 * Стадии «отмечен в работу»: менеджер выбрал вариант (Текущий) или документ по
 * нему уже сформирован (КП, Счёт, Договор, Поставка, Согласование).
 */
export const COMPLECT_VARIANT_ACTIVE_STAGES: readonly ComplectVariantStage[] = [
    COMPLECT_VARIANT_STAGE.current,
    COMPLECT_VARIANT_STAGE.offer,
    COMPLECT_VARIANT_STAGE.invoice,
    COMPLECT_VARIANT_STAGE.contract,
    COMPLECT_VARIANT_STAGE.supply,
    COMPLECT_VARIANT_STAGE.approval,
];

/** Итог подведён: стадия Успех, Отклонён или Не состоялся. */
export const isFinalVariantStage = (stage: ComplectVariantStage): boolean =>
    COMPLECT_VARIANT_FINAL_STAGES.includes(stage);

/** Вариант отмечен в работу: Текущий или любая стадия документа по нему. */
export const isActiveVariantStage = (stage: ComplectVariantStage): boolean =>
    COMPLECT_VARIANT_ACTIVE_STAGES.includes(stage);

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
