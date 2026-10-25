import type { Catalog } from '../../../catalog';
import {
    ACADEMY_INDEX_TO_CODE,
    COMPLECT_NUMBER_TO_CODE,
    CONSALTING_INDEX_TO_CODE,
    CONTRACT_NUMBER_TO_CODE,
    ER_INDEX_TO_CODE,
    ER_PACKET_INDEX_TO_CODE,
    FREEBLOCK_INDEX_TO_CODE,
    LT_NUMBER_TO_CODE,
    LT_PACKAGE_BY_WEIGHT,
    STAR_CODE,
    SUPPLY_CODE_FLASH,
    SUPPLY_CODE_LOCAL,
    SUPPLY_NUMBER_TO_KEY,
    infoblockCodeByName,
} from '../../../catalog';
import type { Composition, LtOtherPacket } from '../../../composition';
import { defaultComposition } from '../../../composition';
import type { KRow, RowPrice, RowSet } from '../../../row-set';
import type { RestoredState } from '../../model/types';
import type { V1CurrentComplect, V1LtOtherPacket, V1Parsed, V1Row, V1RowSet } from './types';

/**
 * Маппер слепка v1 → доменное состояние (code-джойны).
 *
 * Единственное место, где живёт легаси-адресация: все номера и индексы
 * переводятся в коды таблицами из catalog/lib/legacy-codes.ts, а затем
 * проверяются по живому каталогу. Сам каталог легаси-номеров не знает.
 *
 * Правила (см. docs/legacy-persistence.md §5):
 * - filling — ИМЕНА инфоблоков → code (мусорные имена игнорируются);
 * - ers/packetsEr/freeBlocks/consalting/academy — ИНДЕКСЫ позиций;
 * - lt/ltInPacket — бизнес-NUMBER;
 * - star — флаг-массив;
 * - академия: индекс = легаси-номер − 1 (off-by-one);
 * - row.number — счётчик генерации, игнорируется;
 * - role: id === 0 → main; прочие garant в general → additional;
 * - цены НЕ пересчитываются — берутся сохранённые;
 * - composition главной строки — из currentComplect; остальным garant-строкам
 *   в v1 наполнения не было — им ставится дефолт их комплекта.
 */

const complectCodeByNumber = (
    catalog: Catalog,
    number: number | undefined,
): string | null => {
    if (number === undefined) return null;
    const code = COMPLECT_NUMBER_TO_CODE[number];
    return code && catalog.complects.byCode[code] ? code : null;
};

/**
 * Поставка по легаси-номеру: особые (Стандартная, Локальная, Флэш) — по коду,
 * остальные — по (тип, количество ОД) среди обычных поставок каталога.
 */
const supplyCodeByNumber = (
    catalog: Catalog,
    number: number | undefined,
): string | null => {
    if (number === undefined) return null;
    const key = SUPPLY_NUMBER_TO_KEY[number];
    if (!key) return null;
    if (key.special === 'flash') {
        return catalog.supplies.byCode[SUPPLY_CODE_FLASH]?.code ?? null;
    }
    if (key.special === 'local') {
        return catalog.supplies.byCode[SUPPLY_CODE_LOCAL]?.code ?? null;
    }
    return (
        catalog.supplies.items.find(
            supply =>
                supply.type === key.type &&
                supply.usersQuantity === key.usersQuantity &&
                supply.code !== SUPPLY_CODE_FLASH &&
                supply.code !== SUPPLY_CODE_LOCAL,
        )?.code ?? null
    );
};

const contractCodeOf = (
    catalog: Catalog,
    contract: V1Row['contract'] | { number: number; code?: string } | null,
): string | null => {
    if (!contract) return null;
    if (contract.code && catalog.contracts.byCode[contract.code]) {
        return contract.code;
    }
    // Старые записи без code — достройка по number (легаси-миграция rememberRows)
    const code = CONTRACT_NUMBER_TO_CODE[contract.number];
    return code && catalog.contracts.byCode[code] ? code : null;
};

const academyCodeByIndex = (
    catalog: Catalog,
    index: number | undefined,
): string | null => {
    if (index === undefined) return null;
    const code = ACADEMY_INDEX_TO_CODE[index];
    return code && catalog.academy.some(pkg => pkg.code === code) ? code : null;
};

/** currentComplect (номерная адресация) → Composition (codes) */
export const mapV1Composition = (
    legacy: V1CurrentComplect,
    catalog: Catalog,
    regionCodes: string[],
    warnings: string[],
): Composition | null => {
    const complectCode = complectCodeByNumber(catalog, legacy.number);
    if (!complectCode) {
        warnings.push(`Комплект number=${legacy.number} не найден в каталоге`);
        return null;
    }

    const infoblocks: string[] = [];
    for (const name of legacy.filling ?? []) {
        const code = infoblockCodeByName(name);
        if (code) {
            if (!infoblocks.includes(code)) infoblocks.push(code);
        }
        // мусорные имена (ЭР, пакеты, «Интернет-Семинары») — молча пропускаем
    }

    const byIndex = (
        indices: number[] | undefined,
        table: readonly string[],
        label: string,
    ): string[] => {
        const codes: string[] = [];
        for (const index of indices ?? []) {
            const code = table[index];
            if (code) codes.push(code);
            else warnings.push(`${label}: неизвестный индекс ${index}`);
        }
        return codes;
    };

    const byLtNumber = (numbers: number[] | undefined): string[] => {
        const codes: string[] = [];
        for (const number of numbers ?? []) {
            const code = LT_NUMBER_TO_CODE[number];
            if (code) codes.push(code);
            else warnings.push(`lt: неизвестный number ${number}`);
        }
        return codes;
    };

    const consaltingIndex = legacy.consaltingProduct?.[0];

    return {
        complectCode,
        mode: 'rules',
        infoblocks,
        ers: byIndex(legacy.ers, ER_INDEX_TO_CODE, 'ers'),
        erPackets: byIndex(
            legacy.packetsEr,
            ER_PACKET_INDEX_TO_CODE,
            'packetsEr',
        ),
        ersInPacket: byIndex(
            legacy.ersInPacket,
            ER_INDEX_TO_CODE,
            'ersInPacket',
        ),
        lt: byLtNumber(legacy.lt),
        ltInPacket: byLtNumber(legacy.ltInPacket),
        ltOther: [],
        freeBlocks: byIndex(
            legacy.freeBlocks,
            FREEBLOCK_INDEX_TO_CODE,
            'freeBlocks',
        ),
        consalting:
            consaltingIndex !== undefined
                ? (CONSALTING_INDEX_TO_CODE[consaltingIndex] ?? null)
                : null,
        star: (legacy.star?.length ?? 0) > 0,
        academy: academyCodeByIndex(catalog, legacy.academy?.[0]),
        regions: regionCodes,
    };
};

/**
 * Пакеты LT Other записи (поле ltOther, IOtherLtPack[]): сервисы — по code,
 * старые — по number; пустые после маппинга пакеты не переносятся.
 */
export const mapV1LtOther = (
    packets: V1LtOtherPacket[] | null,
    catalog: Catalog,
    warnings: string[],
): LtOtherPacket[] => {
    const known = new Set(catalog.services.lt.map(service => service.code));
    const result: LtOtherPacket[] = [];
    (packets ?? []).forEach((packet, index) => {
        const services: string[] = [];
        for (const service of packet.services ?? []) {
            const code =
                service.code ??
                (service.number !== undefined ? LT_NUMBER_TO_CODE[service.number] : undefined);
            if (code && known.has(code)) {
                if (!services.includes(code)) services.push(code);
            } else {
                warnings.push(
                    `ltOther: сервис ${service.name ?? service.code ?? service.number} не найден в каталоге`,
                );
            }
        }
        if (!services.length) return;
        result.push({
            id: packet.id !== undefined && packet.id !== null ? String(packet.id) : `v1_lt_other_${index}`,
            services,
            alternativeName: packet.alternativePacketName?.trim() || null,
        });
    });
    return result;
};

const mapV1Price = (price: V1Row['price']): RowPrice => ({
    base: price?.default ?? 0,
    current: price?.current ?? 0,
    quantity: price?.quantity ?? 1,
    month: price?.month ?? price?.default ?? 0,
    sum: price?.sum ?? price?.current ?? 0,
    measure: {
        id: price?.measure?.id ?? 0,
        code: price?.measure?.code ?? 0,
        name: price?.measure?.name ?? '',
        type: price?.measure?.type ?? 1,
    },
    discount: {
        percent: price?.discount?.precent ?? 1,
        amount: price?.discount?.amount ?? 0,
        current: price?.discount?.current === 'amount' ? 'amount' : 'percent',
    },
});

/**
 * Код сервиса для сервисных строк по легаси-номеру в `row.complect.number`
 * (легаси складывал туда номер сервиса). У академии стабильного номера в
 * строке нет — код берётся из наполнения главной строки при сборке сета.
 */
const serviceCodeOf = (row: V1Row): string | undefined => {
    const number = row.complect?.number;
    switch (row.productType) {
        case 'lt':
        case 'lt_other':
            return Object.values(LT_PACKAGE_BY_WEIGHT).find(
                item => item.legacyNumber === number,
            )?.code;
        case 'consalting':
            return number !== undefined
                ? CONSALTING_INDEX_TO_CODE[number]
                : undefined;
        case 'star':
            return STAR_CODE;
        default:
            return undefined;
    }
};

/** Рефы главной строки — наследуются «голыми» строками v1 без своих supply/contract. */
interface MainRefs {
    supplyCode: string | null;
    contractCode: string | null;
}

const mapV1Row = (
    row: V1Row,
    setId: string,
    kind: 'general' | 'alternative',
    index: number,
    catalog: Catalog,
    mainComposition: Composition | null,
    mainRefs: MainRefs | null,
    warnings: string[],
): KRow => {
    const isMain = kind === 'general' && row.id === 0;
    const complectCode =
        row.productType === 'garant'
            ? (complectCodeByNumber(catalog, row.complect?.number) ?? undefined)
            : undefined;
    // В легаси второй Гарант/сервисы могли идти без своих supply/contract —
    // они жили у главного товара. Наследуем молча; warning — только когда
    // поставка указана, но в таблице её нет.
    const inheritedSupply = !row.supply && !isMain ? mainRefs?.supplyCode : null;
    const supplyCode =
        inheritedSupply ??
        supplyCodeByNumber(catalog, row.supply?.number) ??
        'unknown';
    if (supplyCode === 'unknown') {
        warnings.push(
            `Строка «${row.name}»: не удалось смапить поставку number=${row.supply?.number}`,
        );
    }
    const inheritedContract = !row.contract && !isMain ? mainRefs?.contractCode : null;
    const contractCode =
        inheritedContract ?? contractCodeOf(catalog, row.contract ?? null);
    if (!contractCode) {
        warnings.push(
            `Строка «${row.name}»: не удалось смапить договор number=${row.contract?.number}`,
        );
    }

    let composition: Composition | undefined;
    if (row.productType === 'garant') {
        if (isMain && mainComposition) {
            composition = mainComposition;
        } else if (complectCode && catalog.complects.byCode[complectCode]) {
            // В v1 наполнение было только у главного товара —
            // остальным ставим дефолт их комплекта
            const complect = catalog.complects.byCode[complectCode]!;
            composition = {
                ...defaultComposition(complect),
                regions: mainComposition?.regions ?? [],
            };
        }
    }

    // Академия: номера пакета в строке нет — берём из наполнения главной строки
    const serviceCode =
        row.productType === 'academy'
            ? (mainComposition?.academy ?? undefined)
            : serviceCodeOf(row);

    return {
        key: `${setId}_${row.productType}_${index}`,
        setId,
        role: kind === 'alternative' ? 'comparison' : isMain ? 'main' : 'additional',
        productType: row.productType,
        refs: {
            complectCode,
            supplyCode,
            contractCode: contractCode ?? 'unknown',
            serviceCode,
        },
        composition,
        names: {
            name: row.name,
            shortName: row.shortName ?? row.name,
            alternativeName: row.alternativeName || null,
        },
        price: mapV1Price(row.price),
        // Академия «в часах» (без monthQuantity) не участвует в едином количестве сета
        quantityLocked:
            row.productType === 'academy'
                ? !row.product?.monthQuantity
                : undefined,
    };
};

const mapV1Set = (
    set: V1RowSet,
    kind: 'general' | 'alternative',
    setIndex: number,
    catalog: Catalog,
    mainComposition: Composition | null,
    mainRefs: MainRefs | null,
    collapsed: boolean,
    warnings: string[],
): RowSet => {
    const id = kind === 'general' ? 'general' : `alt_${setIndex}`;
    const rows: KRow[] = [];
    let index = 0;
    // Старые записи могут не иметь academy/lt_other — обходим только имеющиеся
    for (const groupKey of [
        'garant',
        'lt',
        'lt_other',
        'consalting',
        'star',
        'academy',
    ] as const) {
        for (const row of set.rows?.[groupKey] ?? []) {
            rows.push(
                mapV1Row(
                    row,
                    id,
                    kind,
                    index++,
                    catalog,
                    mainComposition,
                    mainRefs,
                    warnings,
                ),
            );
        }
    }
    return { id, kind, rows, collapsed };
};

export const mapV1 = (parsed: V1Parsed, catalog: Catalog): RestoredState => {
    const warnings = [...parsed.parseErrors.map(field => `Битое поле: ${field}`)];

    const regionCodes = (parsed.regions?.inComplect ?? [])
        .map(region => region.name)
        .filter(Boolean);

    const mapped = parsed.currentComplect
        ? mapV1Composition(
              parsed.currentComplect,
              catalog,
              regionCodes,
              warnings,
          )
        : null;
    // пакеты LT Other жили отдельным полем записи — теперь в наполнении главной строки
    const mainComposition: Composition | null = mapped
        ? { ...mapped, ltOther: mapV1LtOther(parsed.ltOther, catalog, warnings) }
        : null;

    const collapsed = parsed.rows?.show === 'set';
    const generalV1 = parsed.rows?.sets?.general?.[0];

    // Рефы главного товара (garant id 0), иначе — глобальные ОД/договор записи:
    // их наследуют строки без своих supply/contract.
    const mainV1 =
        generalV1?.rows.garant?.find(row => row.id === 0) ??
        generalV1?.rows.garant?.[0];
    const mainRefs: MainRefs = {
        supplyCode:
            supplyCodeByNumber(catalog, mainV1?.supply?.number) ??
            supplyCodeByNumber(catalog, parsed.odNumber ?? undefined),
        contractCode:
            contractCodeOf(catalog, mainV1?.contract ?? null) ??
            contractCodeOf(catalog, parsed.contract),
    };

    const general: RowSet = generalV1
        ? mapV1Set(
              generalV1,
              'general',
              0,
              catalog,
              mainComposition,
              mainRefs,
              collapsed,
              warnings,
          )
        : { id: 'general', kind: 'general', rows: [], collapsed: false };

    const alternative = (parsed.rows?.sets?.alternative ?? []).map(
        (set, index) =>
            mapV1Set(
                set,
                'alternative',
                index,
                catalog,
                mainComposition,
                mainRefs,
                collapsed,
                warnings,
            ),
    );

    return {
        schemaVersion: 1,
        regionCode:
            parsed.globalRegion?.name ?? regionCodes[0] ?? null,
        contractCode: contractCodeOf(catalog, parsed.contract),
        supplyCode: supplyCodeByNumber(catalog, parsed.odNumber ?? undefined),
        general,
        alternative,
        templateId: parsed.templateId,
        warnings,
    };
};
