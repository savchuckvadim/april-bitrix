/** Округление денег до копеек (единственная точка округления модуля) */
export const round2 = (value: number): number => Math.round(value * 100) / 100;
