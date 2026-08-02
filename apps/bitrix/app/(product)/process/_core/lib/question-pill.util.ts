/**
 * Классы пилюли варианта ответа.
 *
 * Четыре состояния: выбран, рекомендован, обычный и выключённый — за последним
 * пока нет механики, поэтому он пунктирный и некликабельный.
 *
 * Раздел намеренно самодостаточен и ничего не берёт из старых страниц
 * (`how-we-work`, `leads-process`): они могут быть удалены.
 */

const BASE =
    'cursor-pointer rounded-full border px-4 py-1.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-primary';

export const questionPillClass = (
    isSelected: boolean,
    isRecommended: boolean,
    isDisabled: boolean,
): string => {
    if (isDisabled) {
        return 'rounded-full border border-dashed px-4 py-1.5 text-sm text-muted-foreground/60 cursor-not-allowed';
    }
    if (isSelected) {
        return `${BASE} border-primary bg-primary/10 font-semibold text-primary`;
    }
    if (isRecommended) {
        return `${BASE} border-success/60 text-success hover:border-success`;
    }
    return `${BASE} text-muted-foreground hover:border-primary hover:text-primary`;
};
