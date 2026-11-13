import type {
    InitV2ComplectDto,
    InitV2Data,
    InitV2ServiceDto,
} from '../../model/dto';
import type {
    Catalog,
    ContractKind,
    KComplect,
    KInfoblock,
    KService,
    KServiceProductType,
} from '../../model/types';
import { emptyCatalog } from '../../model/types';
import { ACADEMY_PACKAGES } from '../academy-data';
import { getComplectRuleFlags } from '../complect-rule-flags';

/**
 * Адаптер ответа POST /api/konstructor/init/data (init v2, code-джойны)
 * → доменный Catalog. Generated-типы приходят через model/dto.ts.
 */

const contractKind = (code: string): ContractKind => {
    if (code.startsWith('abon')) return 'abon';
    if (code.startsWith('lic')) return 'lic';
    if (code === 'key') return 'key';
    return 'service';
};

/**
 * Умолчания ЭР комплекта. Бэк до исправления init клал пакеты и в ers (вес
 * считался дважды), а ersInPacket Офиса отдавал с повторами.
 */
const toErDefaults = (dto: InitV2ComplectDto): Pick<KComplect['defaults'], 'ers' | 'erPackets' | 'ersInPacket'> => {
    const erPackets = dto.codes?.packetsEr ?? [];
    return {
        ers: (dto.codes?.ers ?? []).filter(code => !erPackets.includes(code)),
        erPackets,
        ersInPacket: [...new Set(dto.codes?.ersInPacket ?? [])],
    };
};

/** LT по умолчанию: в БД только связь с комплектом, платность — флаг комплекта. */
const toLtDefaults = (dto: InitV2ComplectDto): Pick<KComplect['defaults'], 'lt' | 'ltInPacket'> => {
    const codes = dto.codes?.lt ?? [];
    return getComplectRuleFlags({ code: dto.tag || dto.name }).ltDefaultsPaid
        ? { lt: [], ltInPacket: codes }
        : { lt: codes, ltInPacket: [] };
};

const toComplect = (dto: InitV2ComplectDto): KComplect => ({
    code: dto.tag || dto.name,
    order: dto.number,
    type: dto.type === 'universal' ? 'universal' : 'prof',
    title: dto.title,
    fullTitle: dto.fullTitle,
    shortTitle: dto.shortTitle,
    weight: dto.weight,
    abs: dto.abs ?? null,
    color: dto.color ?? dto.className ?? null,
    withConsalting: dto.withConsalting,
    withABS: dto.withABS ?? dto.type === 'universal',
    withLt: dto.withLt ?? true,
    withServices: dto.withServices ?? true,
    withDefault: dto.withDefault ?? true,
    isChanging: dto.isChanging,
    defaults: {
        infoblocks: dto.codes?.filling ?? [],
        ...toErDefaults(dto),
        ...toLtDefaults(dto),
        freeBlocks: dto.codes?.freeBlocks ?? [],
        star: Boolean(dto.codes?.star?.length),
    },
});

const toService = (
    dto: InitV2ServiceDto,
    productType: KServiceProductType,
): KService => ({
    code: dto.code,
    order: dto.number,
    name: dto.name,
    fullName: dto.fullName,
    shortName: dto.shortName,
    weight: dto.weight,
    abs: dto.abs,
    color: dto.color,
    productType,
    isPackage: dto.isPackage,
});

/**
 * Состав пакетов ЭР. Бэк до исправления присылал children пустыми — тогда он
 * берётся из комплекта с этим единственным пакетом: там ersInPacket = его ЭР.
 */
const fillErPacketChildren = (catalog: Catalog): void => {
    for (const complect of Object.values(catalog.complects.byCode)) {
        const { erPackets, ersInPacket } = complect.defaults;
        const block = catalog.infoblocks[erPackets[0] ?? ''];
        if (erPackets.length === 1 && block && !block.children.length) {
            block.children = [...ersInPacket];
        }
    }
};

export const catalogFromInitV2 = (data: InitV2Data): Catalog => {
    const catalog = emptyCatalog();

    for (const dto of [
        ...(data.complects?.prof ?? []),
        ...(data.complects?.universal ?? []),
    ]) {
        const complect = toComplect(dto);
        catalog.complects.byCode[complect.code] = complect;
        if (complect.type === 'prof') catalog.complects.prof.push(complect);
        else catalog.complects.universal.push(complect);
    }
    catalog.complects.prof.sort((a, b) => a.order - b.order);
    catalog.complects.universal.sort((a, b) => a.order - b.order);

    for (const group of data.infoblocks ?? []) {
        const codes: string[] = [];
        for (const block of group.value ?? []) {
            codes.push(block.code);
            const infoblock: KInfoblock = {
                code: block.code,
                name: block.name,
                weight: Number(block.weight) || 0,
                groupCode: group.code,
                groupType: group.type,
                isFree: block.isFree,
                isLa: block.isLa,
                parents: block.parent ?? [],
                children: block.children ?? [],
                description: block.description || null,
                shortDescription: block.shortDescription || null,
                descriptionForSale: block.descriptionForSale || null,
            };
            catalog.infoblocks[block.code] = infoblock;
        }
        catalog.groups.push({
            code: group.code,
            name: group.groupName,
            type: group.type,
            productType: group.productType,
            infoblockCodes: codes,
        });
    }

    fillErPacketChildren(catalog);

    for (const dto of data.supplies ?? []) {
        const supply = {
            code: dto.code,
            name: dto.name,
            fullName: dto.fullName,
            shortName: dto.shortName,
            type: (dto.type === 'proxima' ? 'proxima' : 'internet') as
                | 'internet'
                | 'proxima',
            usersQuantity: dto.usersQuantity,
            coefficient: dto.coefficient,
            color: dto.color,
            quantityForKp: dto.quantityForKp ?? null,
            contractPropSuppliesQuantity: dto.contractPropSuppliesQuantity ?? null,
        };
        catalog.supplies.items.push(supply);
        catalog.supplies.byCode[supply.code] = supply;
    }

    for (const dto of data.contracts?.items ?? []) {
        const code = dto.code || dto.shortName;
        const contract = {
            code,
            kind: contractKind(code),
            name: dto.aprilName,
            productName: dto.contract?.productName ?? '',
            shortName: dto.shortName,
            durationMonths: dto.prepayment,
            discount: dto.discount,
            bitrixItemId: dto.itemId,
            measure: {
                id: dto.measureId,
                code: dto.measureCode,
                name: dto.measureName,
                fullName: dto.measureFullName,
            },
            order: dto.order,
        };
        catalog.contracts.items.push(contract);
        catalog.contracts.byCode[contract.code] = contract;
    }
    catalog.contracts.items.sort((a, b) => a.order - b.order);

    for (const dto of data.regions ?? []) {
        const region = {
            code: dto.code,
            title: dto.title,
            abs: dto.abs,
            tax: dto.tax ?? 0,
            taxAbs: dto.tax_abs ?? 0,
            infoblock: dto.infoblock,
            weight: dto.weight ?? 0.5,
            inPortal: dto.inPortal ?? false,
        };
        catalog.regions.items.push(region);
        catalog.regions.byCode[region.code] = region;
    }

    for (const dto of data.measures ?? []) {
        const measure = {
            id: dto.id,
            code: dto.code,
            bitrixId: dto.bitrixId ? Number(dto.bitrixId) : null,
            name: dto.name,
            shortName: dto.shortName,
            fullName: dto.fullName,
        };
        catalog.measures.items.push(measure);
        catalog.measures.byCode[measure.code] = measure;
    }

    for (const dto of data.prices ?? []) {
        catalog.prices.items.push({
            code: dto.code,
            value: dto.value,
            regionScope: dto.region_type === '1' ? 'msk' : 'regions',
            supplyType:
                dto.supply_type === 'internet' || dto.supply_type === 'proxima'
                    ? dto.supply_type
                    : null,
            supplyCode: dto.supply_code,
            complectCode: dto.complect_code,
            packageCode: dto.garant_package_code,
            isSpecial: dto.isSpecial,
            discount: dto.discount,
        });
    }

    catalog.services.lt = (data.services?.lt ?? []).map(dto =>
        toService(dto, 'lt'),
    );
    catalog.services.ltPackages = (data.services?.ltPackages ?? []).map(dto =>
        toService(dto, 'lt'),
    );
    catalog.services.consalting = (data.services?.consalting ?? []).map(dto =>
        toService(dto, 'consalting'),
    );
    catalog.services.star = (data.services?.star ?? []).map(dto =>
        toService(dto, 'star'),
    );

    catalog.academy = ACADEMY_PACKAGES;

    return catalog;
};
