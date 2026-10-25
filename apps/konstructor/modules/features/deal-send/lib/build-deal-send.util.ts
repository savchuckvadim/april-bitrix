import type {
    DealSendDto,
    DealSendFieldDto,
    DealSendProductRowDto,
} from '@workspace/nest-konstructor-api';
import {
    resolveSupply,
    type Catalog,
    type ContractKind,
    type KInfoblock,
} from '@/modules/entities/catalog';
import { buildProductRows, type KRow, type RowSet } from '@/modules/entities/row-set';
import { ltPacketWeight, type Composition } from '@/modules/entities/composition';

/**
 * Чистый маппер «состояние конструктора → DealSendDto» (легаси
 * field-reducer + build-deal-send-request): инфоблочные поля сделки — списки
 * НАЗВАНИЙ блоков по группам, продуктовые — комплект/договор/поставка главной
 * строки. Тексты поставки (supply_for_contract, note…, logins_quantity,
 * contract_supply_prop_q, quantity_for_kp) бэк подставляет сам по
 * `supplyCode` (решение 2) — фронт их не собирает.
 */

export type DealSendField = DealSendFieldDto;
export type DealSendRequest = DealSendDto;
export type DealSendProductRow = DealSendProductRowDto;

export interface DealSendInput {
    domain: string;
    dealId: number | null;
    userId: number | null;
    companyId: number | null;
    dealName: string;
    catalog: Catalog;
    general: RowSet;
    mainRow: KRow;
    /** Открыта сделка для всех (легаси OPENED: Y) */
    opened?: boolean;
    /** Поставщик документов — в поле сделки document_provider (решение 10) */
    providerName?: string | null;
    /** Сервисный отдел, «следующий период»: писать в элемент смарта, не в сделку */
    target?: DealSendRequest['target'];
}

/** Группы инфоблоков init v2 / фикстуры → поля сделки (легаси groupsName). */
const GROUP_FIELD: Record<string, 'npa' | 'la' | 'c' | 'sp'> = {
    npa: 'npa',
    sud: 'la',
    la: 'la',
    cons: 'c',
    c: 'c',
    spec: 'sp',
    new: 'sp',
    sp: 'sp',
};

const name = (catalog: Catalog, code: string): string =>
    catalog.infoblocks[code]?.name ?? code;

const nameOfBlock = (block: KInfoblock | undefined, fallback: string): string =>
    block?.name ?? fallback;

/** Инфоблочные поля сделки: названия выбранных блоков по группам. */
export const buildInfoblockFields = (
    catalog: Catalog,
    composition: Composition,
): DealSendField[] => {
    const groups: Record<'npa' | 'la' | 'c' | 'sp', string[]> = { npa: [], la: [], c: [], sp: [] };
    for (const code of composition.infoblocks) {
        const block = catalog.infoblocks[code];
        if (!block) continue;
        const field = GROUP_FIELD[block.groupCode] ?? 'sp';
        groups[field].push(block.name);
    }
    // бесплатные блоки судебной практики (isLa) идут в «Судебная практика», остальные — в free_blocks
    const freeBlocks: string[] = [];
    for (const code of composition.freeBlocks) {
        const block = catalog.infoblocks[code];
        if (block?.isLa) groups.la.push(block.name);
        else freeBlocks.push(nameOfBlock(block, code));
    }

    const lt = composition.lt.map(code => ltName(catalog, code));
    const ltInPacket = composition.ltInPacket.map(code => ltName(catalog, code));
    const packetWeight = ltPacketWeight(composition, catalog);
    const ltPackage = catalog.services.ltPackages.find(pkg => pkg.weight === packetWeight);

    const consalting = consaltingNames(catalog, composition);

    const fields: DealSendField[] = [
        { code: 'npa', appType: 'update', value: groups.npa },
        { code: 'la', appType: 'update', value: groups.la },
        { code: 'c', appType: 'update', value: groups.c },
        { code: 'sp', appType: 'update', value: groups.sp },
        { code: 'er', appType: 'update', value: composition.ers.map(code => name(catalog, code)) },
        { code: 'per', appType: 'update', value: composition.erPackets.map(code => name(catalog, code)) },
        { code: 'erinpac', appType: 'update', value: composition.ersInPacket.map(code => name(catalog, code)) },
        { code: 'lt', appType: 'update', value: lt },
        { code: 'plt', appType: 'update', value: ltPackage ? [ltPackage.fullName] : [] },
        { code: 'ltinpac', appType: 'update', value: ltInPacket },
        { code: 'free_blocks', appType: 'update', value: freeBlocks },
        { code: 'consalting', appType: 'update', value: consalting },
        { code: 'star', appType: 'update', value: composition.star ? starNames(catalog) : [] },
    ];
    return fields.filter(field => Array.isArray(field.value) && field.value.length > 0);
};

const ltName = (catalog: Catalog, code: string): string =>
    catalog.services.lt.find(service => service.code === code)?.name ?? code;

/** Консалтинг сделки: горячая линия у комплектов с консалтингом + выбранный платный. */
const consaltingNames = (catalog: Catalog, composition: Composition): string[] => {
    const complect = catalog.complects.byCode[composition.complectCode];
    const names: string[] = [];
    const hotline = catalog.services.consalting.find(service => service.code === 'hotline');
    if (complect?.withConsalting && hotline) names.push(hotline.name);
    const paid = catalog.services.consalting.find(service => service.code === composition.consalting);
    if (paid) names.push(paid.name);
    return names;
};

const starNames = (catalog: Catalog): string[] =>
    catalog.services.star.length ? catalog.services.star.map(service => service.name) : ['СТАР'];

/** Продуктовые поля главной строки: комплект, договор, поставка. */
export const buildProductFields = (catalog: Catalog, mainRow: KRow): DealSendField[] => {
    const complect = catalog.complects.byCode[mainRow.refs.complectCode ?? ''];
    const contract = catalog.contracts.byCode[mainRow.refs.contractCode];
    const supply = resolveSupply(catalog, mainRow.refs.supplyCode);
    const fields: DealSendField[] = [];
    if (complect) fields.push({ code: 'complect_name', appType: 'product', value: complect.fullTitle });
    if (contract) {
        fields.push({ code: 'contract_type', appType: 'document', value: contract.bitrixItemId });
        if (contract.durationMonths > 1) {
            fields.push({ code: 'abonement_time', appType: 'product', value: contract.durationMonths });
        }
    }
    if (supply) {
        fields.push({ code: 'supply', appType: 'product', value: supply.name });
        if (supply.quantityForKp) {
            fields.push({ code: 'quantity_for_kp', appType: 'product', value: supply.quantityForKp });
        }
    }
    const paidConsalting = catalog.services.consalting.find(
        service => service.code === mainRow.composition?.consalting,
    );
    if (paidConsalting) {
        fields.push({ code: 'consalting', appType: 'product', value: paidConsalting.name });
    }
    return fields;
};

/** Запрос deal-send целиком: поля + товарные строки general-сета + адрес поставки для текстов. */
export const buildDealSendRequest = (input: DealSendInput): DealSendRequest => {
    const { catalog, mainRow } = input;
    const composition = mainRow.composition;
    const contract = catalog.contracts.byCode[mainRow.refs.contractCode];
    const contractKind: ContractKind | undefined = contract?.kind;
    return {
        domain: input.domain,
        dealId: input.dealId,
        userId: input.userId,
        companyId: input.companyId,
        dealName: input.dealName,
        opened: input.opened ?? true,
        supplyCode: mainRow.refs.supplyCode,
        contractKind,
        fields: [
            ...(composition ? buildInfoblockFields(catalog, composition) : []),
            ...buildProductFields(catalog, mainRow),
            ...(input.providerName
                ? [{ code: 'document_provider' as const, appType: 'document' as const, value: input.providerName }]
                : []),
        ],
        productRows: buildProductRows(input.general, catalog),
        ...(input.target ? { target: input.target } : {}),
    };
};
