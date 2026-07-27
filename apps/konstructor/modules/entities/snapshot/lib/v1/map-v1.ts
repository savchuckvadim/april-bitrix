import type { Catalog } from '../../../catalog';
import {
    CONSALTING_INDEX_TO_CODE,
    ER_INDEX_TO_CODE,
    ER_PACKET_INDEX_TO_CODE,
    FREEBLOCK_INDEX_TO_CODE,
    LT_NUMBER_TO_CODE,
    LT_PACKAGE_BY_WEIGHT,
    STAR_CODE,
    SUPPLY_NUMBER_TO_KEY,
    infoblockCodeByName,
} from '../../../catalog';
import type { Composition } from '../../../composition';
import type { KRow, RowPrice, RowSet } from '../../../row-set';
import type { RestoredState } from '../../model/types';
import type { V1CurrentComplect, V1Parsed, V1Row, V1RowSet } from './types';

/**
 * Маппер слепка v1 → доменное состояние (code-джойны).
 * Правила (см. docs/legacy-persistence.md §5 и отчёт по адресации):
 * - filling — ИМЕНА инфоблоков → code (мусорные имена игнорируются);
 * - ers/packetsEr/freeBlocks/consalting/academy — ИНДЕКСЫ позиций;
 * - lt/ltInPacket — бизнес-NUMBER;
 * - star — флаг-массив;
 * - академия: индекс = number − 1 (off-by-one);
 * - row.number — счётчик генерации, игнорируется; идентичность строки —
 *   (productType, complect.number, supply.number, contract.number|code);
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
    const all = [...catalog.complects.prof, ...catalog.complects.universal];
    return all.find(complect => complect.number === number)?.code ?? null;
};

const supplyCodeByNumber = (
    catalog: Catalog,
    number: number | undefined,
): string | null => {
    if (number === undefined) return null;
    // Сначала прямой legacy-номер (каталог из oldinit его хранит)
    const direct = catalog.supplies.items.find(
        supply => supply.number === number,
    );
    if (direct) return direct.code;
    // Иначе — по (тип, количество ОД)
    const key = SUPPLY_NUMBER_TO_KEY[number];
    if (!key) return null;
    return (
        catalog.supplies.items.find(
            supply =>
                supply.type === key.type &&
                supply.usersQuantity === key.usersQuantity,
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
    return (
        catalog.contracts.items.find(item => item.number === contract.number)
            ?.code ?? null
    );
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
    const academyIndex = legacy.academy?.[0];

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
        // Академия: в слепке индекс = number − 1
        academy:
            academyIndex !== undefined
                ? (catalog.academy.find(pkg => pkg.number === academyIndex + 1)
                      ?.code ?? null)
                : null,
        regions: regionCodes,
    };
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

/** Код сервиса для сервисных строк (lt/consalting/star) по легаси-номеру */
const serviceCodeOf = (
    row: V1Row,
    catalog: Catalog,
): string | undefined => {
    const number = row.complect?.number;
    switch (row.productType) {
        case 'lt':
        case 'lt_other': {
            const pkg = Object.values(LT_PACKAGE_BY_WEIGHT).find(
                item => item.number === number,
            );
            return pkg?.code;
        }
        case 'consalting':
            return number !== undefined
                ? CONSALTING_INDEX_TO_CODE[number]
                : undefined;
        case 'star':
            return STAR_CODE;
        case 'academy':
            // Прямого стабильного номера пакета в легаси-строке нет
            return catalog.academy.length ? undefined : undefined;
        default:
            return undefined;
    }
};

const mapV1Row = (
    row: V1Row,
    setId: string,
    kind: 'general' | 'alternative',
    index: number,
    catalog: Catalog,
    mainComposition: Composition | null,
    warnings: string[],
): KRow => {
    const isMain = kind === 'general' && row.id === 0;
    const complectCode =
        row.productType === 'garant'
            ? (complectCodeByNumber(catalog, row.complect?.number) ?? undefined)
            : undefined;
    const supplyCode =
        supplyCodeByNumber(catalog, row.supply?.number) ?? 'unknown';
    if (supplyCode === 'unknown') {
        warnings.push(
            `Строка «${row.name}»: не удалось смапить поставку number=${row.supply?.number}`,
        );
    }
    const contractCode = contractCodeOf(catalog, row.contract ?? null);
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
                complectCode,
                mode: 'rules',
                infoblocks: [...complect.defaults.infoblocks],
                ers: [...complect.defaults.ers],
                erPackets: [...complect.defaults.erPackets],
                ersInPacket: [...complect.defaults.ersInPacket],
                lt: [],
                ltInPacket: [],
                freeBlocks: [],
                consalting: null,
                star: false,
                academy: null,
                regions: mainComposition?.regions ?? [],
            };
        }
    }

    return {
        key: `${setId}_${row.productType}_${index}`,
        setId,
        role: kind === 'alternative' ? 'comparison' : isMain ? 'main' : 'additional',
        productType: row.productType,
        refs: {
            complectCode,
            supplyCode,
            contractCode: contractCode ?? 'unknown',
            serviceCode: serviceCodeOf(row, catalog),
        },
        composition,
        names: {
            name: row.name,
            shortName: row.shortName ?? row.name,
            alternativeName: row.alternativeName || null,
        },
        price: mapV1Price(row.price),
    };
};

const mapV1Set = (
    set: V1RowSet,
    kind: 'general' | 'alternative',
    setIndex: number,
    catalog: Catalog,
    mainComposition: Composition | null,
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

    const mainComposition = parsed.currentComplect
        ? mapV1Composition(
              parsed.currentComplect,
              catalog,
              regionCodes,
              warnings,
          )
        : null;

    const collapsed = parsed.rows?.show === 'set';
    const generalV1 = parsed.rows?.sets?.general?.[0];
    const general: RowSet = generalV1
        ? mapV1Set(
              generalV1,
              'general',
              0,
              catalog,
              mainComposition,
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
