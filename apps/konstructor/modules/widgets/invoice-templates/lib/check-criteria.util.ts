/**
 * Выбор признаков для проверки подбора: у каждого селекта есть пункт «не
 * задан», а значение Radix Select не бывает пустой строкой, поэтому «не
 * задан» кодируется служебным значением.
 */
export const CHECK_ANY = '__any__';

export interface CheckOption {
    value: string;
    label: string;
}

/** Варианты селекта: первым идёт «не задан» с подписью `anyLabel`. */
export const withAnyOption = (
    anyLabel: string,
    options: readonly CheckOption[],
): CheckOption[] => [{ value: CHECK_ANY, label: anyLabel }, ...options];

/** Значение селекта для кода: нет кода, значит «не задан». */
export const toCheckValue = (code: string | null): string => code ?? CHECK_ANY;

/** Код из значения селекта: «не задан» и неизвестное значение дают `null`. */
export const fromCheckValue = <T extends string>(
    value: string,
    allowed: readonly T[],
): T | null => allowed.find(code => code === value) ?? null;
