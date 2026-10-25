import type { KAcademyPackage } from '../model/types';

/**
 * Пакеты «Академия ГАРАНТ». Перенос хардкода из легаси
 * (academy-checkboxes/academy-data.ts) — в админке академия пока не заведена
 * (решение владельца 24.10.2026: остаётся в коде, перенос в БД — позже).
 *
 * Код пакета `academy_<n>`: n — легаси-номер 1..21, он же суффикс кода в
 * слепках v2, поэтому коды стабильны. 1..17 — лицензия «на срок»
 * (contractLong = [monthQuantity]), 18..21 — «до конца действия комплекта»
 * (любая длительность 1..12). Слепок v1 хранит индекс = n − 1 — см.
 * ACADEMY_INDEX_TO_CODE в legacy-codes.ts.
 */

interface TermPackage {
    legacyNumber: number;
    months: number;
    totalHours: number;
    price: number;
}

interface OpenEndPackage {
    legacyNumber: number;
    totalHours: number;
    price: number;
}

const termPackages: TermPackage[] = [
    { legacyNumber: 1, months: 1, totalHours: 32, price: 2400 },
    { legacyNumber: 2, months: 3, totalHours: 96, price: 7200 },
    { legacyNumber: 3, months: 3, totalHours: 192, price: 14400 },
    { legacyNumber: 4, months: 3, totalHours: 384, price: 28800 },
    { legacyNumber: 5, months: 4, totalHours: 128, price: 9600 },
    { legacyNumber: 6, months: 5, totalHours: 160, price: 12000 },
    { legacyNumber: 7, months: 6, totalHours: 192, price: 14400 },
    { legacyNumber: 8, months: 6, totalHours: 384, price: 28800 },
    { legacyNumber: 9, months: 6, totalHours: 576, price: 43200 },
    { legacyNumber: 10, months: 7, totalHours: 224, price: 16800 },
    { legacyNumber: 11, months: 8, totalHours: 256, price: 19200 },
    { legacyNumber: 12, months: 9, totalHours: 288, price: 21600 },
    { legacyNumber: 13, months: 10, totalHours: 320, price: 24000 },
    { legacyNumber: 14, months: 11, totalHours: 352, price: 26400 },
    { legacyNumber: 15, months: 12, totalHours: 384, price: 28800 },
    { legacyNumber: 16, months: 12, totalHours: 576, price: 43200 },
    { legacyNumber: 17, months: 12, totalHours: 768, price: 57600 },
];

const openEndPackages: OpenEndPackage[] = [
    { legacyNumber: 18, totalHours: 16, price: 1500 },
    { legacyNumber: 19, totalHours: 32, price: 3000 },
    { legacyNumber: 20, totalHours: 96, price: 9000 },
    { legacyNumber: 21, totalHours: 192, price: 18000 },
];

const academyCode = (legacyNumber: number): string => `academy_${legacyNumber}`;

export const ACADEMY_PACKAGES: KAcademyPackage[] = [
    ...termPackages.map(pkg => ({
        code: academyCode(pkg.legacyNumber),
        name: `Корпоративная платформа «Академия ГАРАНТ». Объем доступа ${pkg.totalHours} ч.`,
        totalHours: pkg.totalHours,
        hoursInMonth: pkg.totalHours / pkg.months,
        price: pkg.price,
        contractLong: [pkg.months],
        monthQuantity: pkg.months,
    })),
    ...openEndPackages.map(pkg => ({
        code: academyCode(pkg.legacyNumber),
        name: `До конца действия основного комплекта ГАРАНТ + Академия. Объем доступа к Академии ${pkg.totalHours} часов`,
        totalHours: pkg.totalHours,
        hoursInMonth: null,
        price: pkg.price,
        contractLong: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        monthQuantity: null,
    })),
];
