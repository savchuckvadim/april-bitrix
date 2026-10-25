import {
    COMPLECT_NUMBER_TO_CODE,
    CONTRACT_NUMBER_TO_CODE,
    referenceSupplyForCustom,
    SUPPLY_NUMBER_TO_KEY,
    supplyCodeFromNumber,
    type Catalog,
    type KSupply,
} from '../../catalog';

/**
 * Обратные таблицы «code → легаси-number» для payload документов. Бэк
 * генерации (offer-word / contract / supply-report) принимает легаси-формы с
 * номерами (решение 18: адаптер на фронте сейчас, DTO v2 потом). Это
 * ЕДИНСТВЕННОЕ место, где number появляется вне v1-адаптера слепков.
 */

const invert = (table: Record<number, string>): Record<string, number> =>
    Object.fromEntries(
        Object.entries(table)
            // при дублях (key → 9 и 10) побеждает первый номер
            .filter(([, code], index, all) => all.findIndex(([, c]) => c === code) === index)
            .map(([number, code]) => [code, Number(number)]),
    );

const COMPLECT_CODE_TO_NUMBER = invert(COMPLECT_NUMBER_TO_CODE);
const CONTRACT_CODE_TO_NUMBER = invert(CONTRACT_NUMBER_TO_CODE);
const SUPPLY_CODE_TO_NUMBER: Record<string, number> = Object.fromEntries(
    Object.keys(SUPPLY_NUMBER_TO_KEY).map(number => [
        supplyCodeFromNumber(Number(number)),
        Number(number),
    ]),
);

/** Неизвестный код — 0: легаси-рендер по номерам не ветвится, кроме явных случаев. */
export const complectNumberOf = (code: string | undefined | null): number =>
    code ? (COMPLECT_CODE_TO_NUMBER[code] ?? 0) : 0;

export const contractNumberOf = (code: string): number => CONTRACT_CODE_TO_NUMBER[code] ?? 0;

/** X-ОД — номер ближайшей справочной поставки того же типа (как у текстов на бэке). */
export const supplyNumberOf = (catalog: Catalog, supply: KSupply): number => {
    const direct = SUPPLY_CODE_TO_NUMBER[supply.code];
    if (direct !== undefined) return direct;
    const reference = referenceSupplyForCustom(catalog, supply.type, supply.usersQuantity);
    return reference ? (SUPPLY_CODE_TO_NUMBER[reference.code] ?? 0) : 0;
};
