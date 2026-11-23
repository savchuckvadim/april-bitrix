import { resolveSupply, type Catalog } from '../../catalog';
import { COMPLECT_MODE, type ComplectMode } from '../../complect-variant/model/dto';
import {
    buildVariantEntries,
    type SkippedVariant,
    type VariantEntry,
    type VariantsPayloadInput,
} from '../../offer-document/lib/build-variants-payload';
import { findMainRow, type RowSet } from '../../row-set';

/**
 * Договорная единица: один договор одного варианта комплекта. Единицы
 * появляются, когда варианты продаются вместе (режим «разными договорами» или
 * «одним договором») и участников два и больше. Иначе единиц нет, и экран
 * работает по живому состоянию, как до вариантов.
 */

/** Шапка карточки единицы: что за договор. */
export interface ContractUnitSummary {
    /** Название главного комплекта */
    complect: string;
    /** Поставка (доступ) главной строки */
    supply: string;
    /** Вид договора главной строки */
    contract: string;
}

export interface ContractUnit {
    /** Ключ единицы в состоянии: строка от variantSmartId */
    key: string;
    variantSmartId: number | null;
    /** Название варианта — заголовок карточки */
    title: string;
    /** Вариант открыт в конструкторе: набор строк взят из живого состояния */
    isOpen: boolean;
    /** Общий набор, по которому собирается договор единицы */
    general: RowSet;
    summary: ContractUnitSummary;
}

export interface ContractUnitsResult {
    units: ContractUnit[];
    /** Участники, которых собрать нельзя: по ним формирование блокируется */
    skipped: SkippedVariant[];
}

export interface ContractUnitsInput extends VariantsPayloadInput {
    mode: ComplectMode;
}

/** Единиц нет: один и тот же объект, чтобы подписчики селектора не перерисовывались зря. */
export const NO_CONTRACT_UNITS: ContractUnitsResult = { units: [], skipped: [] };

/** Пояснение к режиму «одним договором»: общий договор бэк пока не собирает. */
export const SINGLE_CONTRACT_NOTE =
    'Один договор на все наборы появится после обновления шаблонов договоров. ' +
    'Сейчас формируется отдельный договор на каждый набор.';

const NO_VALUE = '—';

/** Ключ единицы: строка от variantSmartId; записи без смарта ключом служит её id. */
export const contractUnitKey = (entry: Pick<VariantEntry, 'variantSmartId' | 'record'>): string =>
    entry.variantSmartId !== null ? String(entry.variantSmartId) : `record-${entry.record.id}`;

/** Шапка карточки по главной строке набора: комплект, поставка, вид договора. */
export const summarizeContractUnit = (catalog: Catalog, general: RowSet): ContractUnitSummary => {
    const main = findMainRow(general);
    if (!main) return { complect: NO_VALUE, supply: NO_VALUE, contract: NO_VALUE };
    const { complectCode, supplyCode, contractCode } = main.refs;
    return {
        complect: catalog.complects.byCode[complectCode ?? '']?.title ?? main.names.shortName,
        supply: resolveSupply(catalog, supplyCode)?.name ?? NO_VALUE,
        contract: catalog.contracts.byCode[contractCode]?.name ?? NO_VALUE,
    };
};

const toUnit = (catalog: Catalog, entry: VariantEntry): ContractUnit => ({
    key: contractUnitKey(entry),
    variantSmartId: entry.variantSmartId,
    title: entry.title,
    isOpen: entry.isOpen,
    general: entry.general,
    summary: summarizeContractUnit(catalog, entry.general),
});

/**
 * Единицы договора по участникам документов. Режим «по одному» единиц не
 * даёт: в договор идёт открытый вариант, он и есть живое состояние.
 * Участников меньше двух тоже единиц не даёт. Участники — те же, что у КП
 * (buildVariantEntries), открытый вариант берётся из живого состояния,
 * остальные из слепков; кого собрать нельзя, попадает в `skipped`.
 */
export const buildContractUnits = (input: ContractUnitsInput): ContractUnitsResult => {
    if (input.mode === COMPLECT_MODE.compare) return NO_CONTRACT_UNITS;
    const { entries, skipped } = buildVariantEntries(input);
    if (entries.length + skipped.length < 2) return NO_CONTRACT_UNITS;
    return { units: entries.map(entry => toUnit(input.catalog, entry)), skipped };
};
