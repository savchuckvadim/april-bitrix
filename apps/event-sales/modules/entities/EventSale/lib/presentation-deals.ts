import type { PBXCategory } from '@workspace/pbx';

/** Код воронки презентаций в слепке портала. */
export const PRESENTATION_CATEGORY_CODE = 'sales_presentation';

/**
 * Номер воронки презентаций по слепку портала; null — воронки нет.
 *
 * Числовые id воронок на порталах разные, поэтому спрашиваем слепок, а не
 * зашиваем константу.
 */
export const getPresentationCategoryId = (
    categories: ReadonlyArray<PBXCategory> | undefined,
): number | null => {
    const category = (categories ?? []).find(
        item => item.code === PRESENTATION_CATEGORY_CODE,
    );
    const id = Number(category?.bitrixId);
    return Number.isFinite(id) ? id : null;
};
