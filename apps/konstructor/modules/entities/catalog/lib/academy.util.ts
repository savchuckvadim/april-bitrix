import type { Catalog, KAcademyPackage, KContract } from '../model/types';

/**
 * Академия привязана к сроку сделки (легаси useAcademy): срок = количество
 * товара × длительность договора в месяцах. Пакет «на срок» подходит, только
 * когда его срок равен сроку сделки; пакеты «до конца комплекта» — всегда.
 */

export const termMonthsOf = (
    quantity: number,
    contract: Pick<KContract, 'durationMonths'>,
): number => quantity * contract.durationMonths;

export const academyFits = (pkg: KAcademyPackage, termMonths: number): boolean =>
    pkg.contractLong.includes(termMonths);

/** Пакеты под срок сделки; срок неизвестен (нет договора) — все */
export const academyPackagesFor = (
    catalog: Catalog,
    termMonths: number | null,
): KAcademyPackage[] =>
    termMonths === null
        ? catalog.academy
        : catalog.academy.filter(pkg => academyFits(pkg, termMonths));

export const academyPackageLabel = (pkg: KAcademyPackage): string =>
    `${pkg.totalHours} ч · ${pkg.monthQuantity ? `${pkg.monthQuantity} мес` : 'до конца комплекта'} · ${pkg.price.toLocaleString('ru-RU')} ₽`;
