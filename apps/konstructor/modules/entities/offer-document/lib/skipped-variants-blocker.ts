import type { SkippedVariant, SkippedVariantReason } from './build-variants-payload';

const REASON_TEXT: Record<SkippedVariantReason, string> = {
    snapshotUnreadable: 'слепок не читается',
    noMainRow: 'нет главной строки комплекта, её договора или поставки в каталоге',
};

const FIX_TEXT: Record<SkippedVariantReason, string> = {
    snapshotUnreadable: 'Откройте вариант и сохраните его заново или отклоните его',
    noMainRow: 'Откройте вариант и соберите комплект заново или отклоните его',
};

/**
 * Подпись к заблокированной кнопке документа: какой вариант-участник нельзя
 * включить, почему и что с ним делать. По одному предложению на вариант;
 * пропущенных нет — null, документ не блокируется.
 */
export const skippedVariantsBlocker = (skipped: readonly SkippedVariant[]): string | null => {
    if (!skipped.length) return null;
    return skipped
        .map(
            variant =>
                `Вариант «${variant.title}» нельзя включить в документ: ${REASON_TEXT[variant.reason]}. ${FIX_TEXT[variant.reason]}`,
        )
        .join('. ');
};
