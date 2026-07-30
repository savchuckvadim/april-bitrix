/**
 * Синглтоны Intl-форматтеров таймлайна.
 *
 * `new Intl.NumberFormat(...)` — дорогой конструктор (загрузка локали);
 * раньше он создавался на каждый вызов formatCurrency в каждой строке
 * таблицы (сотни компаний × 3 значения = сотни инстансов на рендер).
 * Один инстанс на модуль убирает эту стоимость целиком.
 */

const currencyFormatter = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 0,
});

/** «1 234 567 ₽» — валюта без копеек. */
export const formatCurrency = (value: number): string =>
    currencyFormatter.format(value);

/** «1 234 567» — целое с разрядами (замена toLocaleString в циклах). */
export const formatNumber = (value: number): string =>
    numberFormatter.format(value);

/** «12.3%» — процент с одним знаком. */
export const formatPercentage = (value: number): string =>
    `${value.toFixed(1)}%`;
