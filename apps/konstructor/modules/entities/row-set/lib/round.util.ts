/**
 * Округление денег до копеек — единственная точка округления модуля.
 * Через toFixed, как в легаси (`parseFloat(x.toFixed(2))` в row-price-utils
 * и documentPrice): Math.round(x * 100) / 100 расходится с ним на
 * половинках копейки (2.675 → 2.68 против 2.67), а цены слепков должны
 * совпадать с легаси до копейки.
 */
export const round2 = (value: number): number => Number(value.toFixed(2));
