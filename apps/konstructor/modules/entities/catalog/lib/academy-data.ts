import type { KAcademyPackage } from '../model/types';

/**
 * Пакеты «Академия ГАРАНТ». Перенос хардкода из легаси
 * (academy-checkboxes/academy-data.ts) — в админке академия пока не заведена.
 * number 1..17 — лицензия «на срок» (contractLong = [monthQuantity]),
 * number 18..21 — «до конца действия комплекта» (любая длительность 1..12).
 * ВНИМАНИЕ: в легаси-слепках индекс академии = number − 1 (off-by-one).
 */

const termPackages: Array<{
    number: number;
    months: number;
    totalHours: number;
    price: number;
}> = [
    { number: 1, months: 1, totalHours: 32, price: 2400 },
    { number: 2, months: 3, totalHours: 96, price: 7200 },
    { number: 3, months: 3, totalHours: 192, price: 14400 },
    { number: 4, months: 3, totalHours: 384, price: 28800 },
    { number: 5, months: 4, totalHours: 128, price: 9600 },
    { number: 6, months: 5, totalHours: 160, price: 12000 },
    { number: 7, months: 6, totalHours: 192, price: 14400 },
    { number: 8, months: 6, totalHours: 384, price: 28800 },
    { number: 9, months: 6, totalHours: 576, price: 43200 },
    { number: 10, months: 7, totalHours: 224, price: 16800 },
    { number: 11, months: 8, totalHours: 256, price: 19200 },
    { number: 12, months: 9, totalHours: 288, price: 21600 },
    { number: 13, months: 10, totalHours: 320, price: 24000 },
    { number: 14, months: 11, totalHours: 352, price: 26400 },
    { number: 15, months: 12, totalHours: 384, price: 28800 },
    { number: 16, months: 12, totalHours: 576, price: 43200 },
    { number: 17, months: 12, totalHours: 768, price: 57600 },
];

const openEndPackages: Array<{
    number: number;
    totalHours: number;
    price: number;
}> = [
    { number: 18, totalHours: 16, price: 1500 },
    { number: 19, totalHours: 32, price: 3000 },
    { number: 20, totalHours: 96, price: 9000 },
    { number: 21, totalHours: 192, price: 18000 },
];

export const ACADEMY_PACKAGES: KAcademyPackage[] = [
    ...termPackages.map(pkg => ({
        number: pkg.number,
        code: `academy_${pkg.number}`,
        name: `Корпоративная платформа «Академия ГАРАНТ». Объем доступа ${pkg.totalHours} ч.`,
        totalHours: pkg.totalHours,
        hoursInMonth: pkg.totalHours / pkg.months,
        price: pkg.price,
        contractLong: [pkg.months],
        monthQuantity: pkg.months,
    })),
    ...openEndPackages.map(pkg => ({
        number: pkg.number,
        code: `academy_${pkg.number}`,
        name: `До конца действия основного комплекта ГАРАНТ + Академия. Объем доступа к Академии ${pkg.totalHours} часов`,
        totalHours: pkg.totalHours,
        hoursInMonth: null,
        price: pkg.price,
        contractLong: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        monthQuantity: null,
    })),
];
