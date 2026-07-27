import type {
    Catalog,
    ContractKind,
    KComplect,
    KContract,
    KInfoblock,
    KPrice,
    KRegion,
    KService,
    KSupply,
} from '../../model/types';
import { emptyCatalog } from '../../model/types';
import { ACADEMY_PACKAGES } from '../academy-data';
import {
    COMPLECT_NUMBER_TO_CODE,
    CONSALTING_INDEX_TO_CODE,
    ER_INDEX_TO_CODE,
    ER_PACKET_INCLUDING,
    ER_PACKET_INDEX_TO_CODE,
    FREEBLOCK_INDEX_TO_CODE,
    INFOBLOCK_GROUP_BY_CODE,
    INFOBLOCK_NAME_TO_CODE,
    INFOBLOCK_WEIGHT_BY_CODE,
    LT_CODE_WEIGHT,
    LT_NUMBER_TO_CODE,
    LT_PACKAGE_BY_WEIGHT,
    STAR_CODE,
    SUPPLY_NUMBER_TO_KEY,
    supplyCodeFromNumber,
} from '../legacy-codes';

/**
 * Каталог из дампа СТАРОГО init (docs/oldinit.json).
 * Используется в тестах паритета цен/правил и как dev-фикстура,
 * пока данные не заведены в БД. Коды синтезируются по legacy-codes.
 */

interface OldInit {
    complects: Array<{
        number: number;
        name: string;
        fullName?: string;
        shortName: string;
        weight: number | string;
        abs: number | false;
        type: 'prof' | 'universal';
        withConsalting: boolean;
        isChanging: boolean;
    }>;
    supplies: Array<{
        number: number;
        name: string;
        type: 'internet' | 'proxima';
        coefficient: number;
    }>;
    contracts: {
        current: unknown[];
        items: Array<{
            number: number;
            aprilName: string;
            shortName: string;
            itemId: number;
            measureId: number;
            measureCode: number;
            measureName: string;
            measureFullName: string;
            discount: number;
            prepayment: number;
            order: number;
        }>;
    };
    regions: Array<{
        number: number;
        title: string;
        name: string;
        abs: number;
        infoblock: string;
    }>;
    prices: {
        prof: Array<{
            complectNumber: number;
            supplyNumber: number;
            price: number;
            region: number;
        }>;
        universal: unknown[];
    };
    legalTech: {
        lt: Array<{
            number: number;
            code: string;
            name: string;
            fullName: string;
            weight: number;
            msk: number;
            regions: number;
        }>;
        packages: Array<{
            number: number;
            name: string;
            fullName: string;
            weight: number;
            msk: number;
            regions: number;
        }>;
    };
    consalting: Array<{
        number: number;
        name: string;
        title: string;
        code: string;
        abs: number;
        price: number;
    }>;
    star: Array<{
        number: number;
        name: string;
        fullName: string;
        msk: number;
        regions: number;
        weight: number;
    }>;
}

const contractKind = (code: string): ContractKind => {
    if (code.startsWith('abon')) return 'abon';
    if (code.startsWith('lic')) return 'lic';
    if (code === 'key') return 'key';
    return 'service';
};

export const catalogFromOldInit = (raw: unknown): Catalog => {
    const old = raw as OldInit;
    const catalog = emptyCatalog();

    // --- комплекты ---
    for (const item of old.complects ?? []) {
        const code = COMPLECT_NUMBER_TO_CODE[item.number];
        if (!code) continue;
        const complect: KComplect = {
            code,
            number: item.number,
            type: item.type,
            title: item.name,
            fullTitle: item.fullName ?? item.name,
            shortTitle: item.shortName,
            weight: Number(item.weight) || 0,
            abs: item.abs === false ? null : Number(item.abs),
            color: null,
            withConsalting: item.withConsalting,
            withABS: item.type === 'universal',
            withLt: true,
            withServices: true,
            withDefault: true,
            isChanging: item.isChanging,
            defaults: { infoblocks: [], ers: [], erPackets: [], ersInPacket: [] },
        };
        catalog.complects.byCode[code] = complect;
        if (item.type === 'prof') catalog.complects.prof.push(complect);
        else catalog.complects.universal.push(complect);
    }
    catalog.complects.prof.sort((a, b) => a.number - b.number);
    catalog.complects.universal.sort((a, b) => a.number - b.number);

    // --- поставки (ОД) ---
    for (const item of old.supplies ?? []) {
        const key = SUPPLY_NUMBER_TO_KEY[item.number];
        const supply: KSupply = {
            code: supplyCodeFromNumber(item.number),
            number: item.number,
            name: item.name,
            fullName: item.name,
            shortName: item.name,
            type: item.type,
            usersQuantity: key?.usersQuantity ?? 0,
            coefficient: item.coefficient,
            color: null,
        };
        catalog.supplies.items.push(supply);
        catalog.supplies.byCode[supply.code] = supply;
    }
    catalog.supplies.items.sort((a, b) => (a.number ?? 0) - (b.number ?? 0));

    // --- договоры ---
    for (const item of old.contracts?.items ?? []) {
        const contract: KContract = {
            code: item.shortName,
            kind: contractKind(item.shortName),
            name: item.aprilName,
            shortName: item.shortName,
            durationMonths: item.prepayment,
            discount: item.discount,
            bitrixItemId: item.itemId,
            measure: {
                id: item.measureId,
                code: item.measureCode,
                name: item.measureName,
                fullName: item.measureFullName,
            },
            number: item.number,
            order: item.order,
        };
        catalog.contracts.items.push(contract);
        catalog.contracts.byCode[contract.code] = contract;
    }
    catalog.contracts.items.sort((a, b) => a.order - b.order);

    // --- регионы ---
    for (const item of old.regions ?? []) {
        const region: KRegion = {
            code: item.name,
            number: item.number,
            title: item.title,
            abs: item.abs,
            tax: 0,
            taxAbs: 0,
            infoblock: item.infoblock,
            weight: 0.5,
        };
        catalog.regions.items.push(region);
        catalog.regions.byCode[region.code] = region;
    }

    // --- прайс PROF: number-джойны → code-джойны ---
    for (const price of old.prices?.prof ?? []) {
        const complectCode = COMPLECT_NUMBER_TO_CODE[price.complectNumber];
        const supplyKey = SUPPLY_NUMBER_TO_KEY[price.supplyNumber];
        if (!complectCode || !supplyKey) continue;
        const item: KPrice = {
            code: `prof_${price.complectNumber}_${price.supplyNumber}_${price.region}`,
            value: price.price,
            regionScope: price.region === 1 ? 'msk' : 'regions',
            supplyType: supplyKey.type,
            supplyCode: supplyCodeFromNumber(price.supplyNumber),
            complectCode,
            packageCode: null,
            isSpecial: false,
            discount: null,
        };
        catalog.prices.items.push(item);
    }

    // --- сервисы: LT ---
    const pushServicePrices = (code: string, msk: number, regions: number) => {
        if (!msk && !regions) return;
        catalog.prices.items.push(
            {
                code: `svc_${code}_msk`,
                value: msk,
                regionScope: 'msk',
                supplyType: null,
                supplyCode: null,
                complectCode: null,
                packageCode: code,
                isSpecial: false,
                discount: null,
            },
            {
                code: `svc_${code}_regions`,
                value: regions,
                regionScope: 'regions',
                supplyType: null,
                supplyCode: null,
                complectCode: null,
                packageCode: code,
                isSpecial: false,
                discount: null,
            },
        );
    };

    for (const lt of old.legalTech?.lt ?? []) {
        const code = lt.code || LT_NUMBER_TO_CODE[lt.number];
        if (!code) continue;
        const service: KService = {
            code,
            number: lt.number,
            name: lt.name,
            fullName: lt.fullName,
            shortName: lt.name,
            weight: LT_CODE_WEIGHT[code] ?? lt.weight ?? 1,
            abs: null,
            color: null,
            productType: 'lt',
            isPackage: false,
        };
        catalog.services.lt.push(service);
        pushServicePrices(code, lt.msk, lt.regions);
    }
    catalog.services.lt.sort((a, b) => a.number - b.number);

    for (const pkg of old.legalTech?.packages ?? []) {
        const byWeight = LT_PACKAGE_BY_WEIGHT[pkg.weight];
        const code = byWeight?.code ?? `ltpack_${pkg.number}`;
        const service: KService = {
            code,
            number: pkg.number,
            name: pkg.name,
            fullName: pkg.fullName,
            shortName: pkg.name,
            weight: pkg.weight,
            abs: null,
            color: null,
            productType: 'lt',
            isPackage: true,
        };
        catalog.services.ltPackages.push(service);
        pushServicePrices(code, pkg.msk, pkg.regions);
    }

    // --- консалтинг ---
    for (const cons of old.consalting ?? []) {
        const code = cons.code || CONSALTING_INDEX_TO_CODE[cons.number];
        if (!code) continue;
        catalog.services.consalting.push({
            code,
            number: cons.number,
            name: cons.name,
            fullName: cons.title,
            shortName: cons.name,
            weight: 0,
            abs: cons.abs,
            color: null,
            productType: 'consalting',
            isPackage: false,
        });
    }

    // --- СТАР ---
    for (const star of old.star ?? []) {
        catalog.services.star.push({
            code: STAR_CODE,
            number: star.number,
            name: star.name,
            fullName: star.fullName,
            shortName: star.name,
            weight: star.weight,
            abs: null,
            color: null,
            productType: 'star',
            isPackage: true,
        });
        pushServicePrices(STAR_CODE, star.msk, star.regions);
    }

    // --- академия (хардкод) ---
    catalog.academy = ACADEMY_PACKAGES;

    // --- инфоблоки из легаси-таблиц (в oldinit их нет — они были хардкодом фронта) ---
    const addInfoblock = (block: KInfoblock) => {
        catalog.infoblocks[block.code] = block;
    };
    for (const [name, code] of Object.entries(INFOBLOCK_NAME_TO_CODE)) {
        addInfoblock({
            code,
            name,
            weight: INFOBLOCK_WEIGHT_BY_CODE[code] ?? 0,
            groupCode: INFOBLOCK_GROUP_BY_CODE[code] ?? 'spec',
            groupType: 'infoblocks',
            isFree: false,
            isLa: ['la', 'laa', 'lgeneral', 'lencyc', 'lv'].includes(code),
            parents: [],
            children: [],
            description: null,
            shortDescription: null,
        });
    }
    ER_INDEX_TO_CODE.forEach((code, index) => {
        addInfoblock({
            code,
            name: `ЭР ${index}`,
            weight: 0.5,
            groupCode: 'er',
            groupType: 'er',
            isFree: false,
            isLa: false,
            parents: ER_PACKET_INDEX_TO_CODE.filter(packet =>
                ER_PACKET_INCLUDING[packet]?.includes(code),
            ),
            children: [],
            description: null,
            shortDescription: null,
        });
    });
    ER_PACKET_INDEX_TO_CODE.forEach(code => {
        addInfoblock({
            code,
            name: `Пакет ${code}`,
            weight: 1,
            groupCode: 'per',
            groupType: 'er',
            isFree: false,
            isLa: false,
            parents: [],
            children: [...(ER_PACKET_INCLUDING[code] ?? [])],
            description: null,
            shortDescription: null,
        });
    });
    FREEBLOCK_INDEX_TO_CODE.forEach((code, index) => {
        addInfoblock({
            code,
            name: `Бесплатный блок ${index}`,
            weight: 0,
            groupCode: 'free',
            groupType: 'free',
            isFree: true,
            isLa: [5, 6, 7].includes(index),
            parents: [],
            children: [],
            description: null,
            shortDescription: null,
        });
    });

    return catalog;
};
