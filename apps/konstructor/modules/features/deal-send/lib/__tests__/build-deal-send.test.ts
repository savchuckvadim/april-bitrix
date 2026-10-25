import { describe, expect, it } from 'vitest';
import oldInit from '@/modules/entities/catalog/lib/__fixtures__/oldinit.json';
import { catalogFromOldInit } from '@/modules/entities/catalog';
import { defaultComposition } from '@/modules/entities/composition';
import { buildGarantRow, createSet, upsertRow } from '@/modules/entities/row-set';
import { buildDealSendRequest, buildInfoblockFields, buildProductFields } from '../build-deal-send.util';

/**
 * Маппер deal-send: поля сделки — названия блоков по группам (легаси
 * field-reducer), продуктовые — главная строка, тексты поставки — бэк по
 * supplyCode, товарные строки — general.
 */
const catalog = catalogFromOldInit(oldInit);
const complect = catalog.complects.byCode['buh']!;
const composition = {
    ...defaultComposition(complect),
    infoblocks: ['rus', 'reg', 'la', 'bbu', 'ntss'],
    ers: ['erprov'],
    erPackets: ['perbuh'],
    ersInPacket: ['erxs', 'ertax'],
    lt: ['ltsut', 'ltconstructor'],
    ltInPacket: ['ltdisk', 'ltconnect'],
    freeBlocks: ['praim', 'online2'],
    consalting: 'sovex',
    star: true,
};
const mainRow = {
    ...buildGarantRow({
        catalog,
        regionCode: 'stv',
        withTax: false,
        key: 'r1',
        setId: 'general',
        role: 'main' as const,
        complectCode: 'buh',
        supplyCode: 'internet_5',
        contractCode: 'abonYear',
    })!,
    composition,
};
const general = upsertRow(createSet('general', 'general'), mainRow);
const field = (fields: Array<{ code: string; appType?: string; value: unknown }>, code: string, appType?: string) =>
    fields.find(f => f.code === code && (!appType || f.appType === appType))?.value;

describe('buildInfoblockFields', () => {
    const fields = buildInfoblockFields(catalog, composition);

    it('инфоблоки раскладываются по группам названиями; isLa-бесплатные — в судебную практику', () => {
        expect(field(fields, 'npa')).toEqual(['Законодательство России', 'Региональное законодательство']);
        expect(field(fields, 'la')).toEqual([
            catalog.infoblocks['la']!.name,
            catalog.infoblocks['online2']!.name,
        ]);
        expect(field(fields, 'c')).toEqual([catalog.infoblocks['bbu']!.name]);
        expect(field(fields, 'sp')).toEqual([catalog.infoblocks['ntss']!.name]);
        expect(field(fields, 'free_blocks')).toEqual([catalog.infoblocks['praim']!.name]);
    });

    it('ЭР, пакеты, LT (бесплатные / в пакете / сам пакет по весу), консалтинг, СТАР', () => {
        expect(field(fields, 'er')).toEqual([catalog.infoblocks['erprov']!.name]);
        expect(field(fields, 'per')).toEqual([catalog.infoblocks['perbuh']!.name]);
        expect(field(fields, 'erinpac')).toHaveLength(2);
        expect(field(fields, 'lt')).toHaveLength(2);
        expect(field(fields, 'ltinpac')).toHaveLength(2);
        // ltdisk + ltconnect = вес 2 → Малый пакет
        expect(field(fields, 'plt')).toEqual([
            catalog.services.ltPackages.find(pkg => pkg.weight === 2)!.fullName,
        ]);
        expect(field(fields, 'consalting')).toContain(
            catalog.services.consalting.find(s => s.code === 'sovex')!.name,
        );
        expect(field(fields, 'star')).toHaveLength(1);
        // пустые списки не шлём
        expect(fields.every(f => Array.isArray(f.value) && f.value.length > 0)).toBe(true);
    });
});

describe('buildProductFields / buildDealSendRequest', () => {
    it('продуктовые поля главной строки: комплект, тип договора, срок, поставка', () => {
        const fields = buildProductFields(catalog, mainRow);
        expect(field(fields, 'complect_name')).toBe(complect.fullTitle);
        expect(field(fields, 'contract_type', 'document')).toBe(catalog.contracts.byCode['abonYear']!.bitrixItemId);
        expect(field(fields, 'abonement_time')).toBe(12);
        expect(field(fields, 'supply')).toBe('Интернет 5 ОД');
        expect(field(fields, 'quantity_for_kp')).toBe(catalog.supplies.byCode['internet_5']!.quantityForKp);
        expect(field(fields, 'consalting', 'product')).toBeDefined();
    });

    it('запрос целиком: адрес поставки для текстов бэка, строки general, пустые поля отфильтрованы', () => {
        const request = buildDealSendRequest({
            domain: 'gsr.bitrix24.ru',
            dealId: null,
            userId: 447,
            companyId: 95817,
            dealName: 'Тест',
            catalog,
            general,
            mainRow,
        });
        expect(request.supplyCode).toBe('internet_5');
        expect(request.contractKind).toBe('abon');
        expect(request.opened).toBe(true);
        expect(request.productRows).toHaveLength(1);
        expect(request.productRows![0]!.productId).toBe(catalog.contracts.byCode['abonYear']!.bitrixItemId);
        expect(request.fields.some(f => f.code === 'supply_for_contract')).toBe(false);
        expect(request.fields.every(f => f.value !== '' && f.value !== null)).toBe(true);
    });
});
