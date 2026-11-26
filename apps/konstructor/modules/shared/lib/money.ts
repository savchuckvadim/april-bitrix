/** Сумма в рублях в русской локали: «27 200 ₽», копейки — до двух знаков. */
export const formatRub = (value: number): string =>
    `${value.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} ₽`;
