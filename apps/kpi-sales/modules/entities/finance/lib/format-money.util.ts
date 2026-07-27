/** Форматирование денег финансового отчёта (₽, ru-RU). */

export const formatMoney = (value: number): string =>
    Number.isFinite(value)
        ? `${Math.round(value).toLocaleString('ru-RU')} ₽`
        : '0 ₽';

/** Компактно для осей графиков: 1,2 млн / 340 тыс / 900. */
export const formatMoneyCompact = (value: number): string => {
    const abs = Math.abs(value);
    if (abs >= 1_000_000) {
        return `${(value / 1_000_000).toLocaleString('ru-RU', {
            maximumFractionDigits: 1,
        })} млн`;
    }
    if (abs >= 1_000) {
        return `${Math.round(value / 1_000).toLocaleString('ru-RU')} тыс`;
    }
    return Math.round(value).toLocaleString('ru-RU');
};
