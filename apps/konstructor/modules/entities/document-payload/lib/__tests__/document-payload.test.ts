import { describe, expect, it } from 'vitest';
import oldInit from '../../../catalog/lib/__fixtures__/oldinit.json';
import { catalogFromOldInit } from '../../../catalog';
import { defaultComposition } from '../../../composition';
import { buildGarantRow, createSet, upsertRow } from '../../../row-set';
import { complectNumberOf, contractNumberOf, supplyNumberOf } from '../legacy-numbers.util';
import { buildComplectGroups } from '../build-complect-groups';
import { toDocContract, toDocSupply } from '../build-doc-refs';
import { toDocRow, toDocRowSets } from '../build-doc-rows';
import { buildOfferPayload } from '../build-offer-payload';

/**
 * Адаптер домен → легаси-payload документов (решение 18). Эталон — формы,
 * которые строил легаси-фронт: номера из таблиц legacy-codes, группы
 * инфоблоков с checked, строки/сеты с total.
 */
const catalog = catalogFromOldInit(oldInit);
const complect = catalog.complects.byCode['buh']!;
const composition = {
    ...defaultComposition(complect),
    infoblocks: ['rus', 'reg', 'la', 'bbu', 'ntss'],
    regions: ['stv'],
    ers: ['erprov'],
    erPackets: ['perbuh'],
    lt: ['ltsut', 'ltconstructor'],
    ltInPacket: ['ltdisk', 'ltconnect'],
    freeBlocks: ['praim', 'online2'],
    consalting: 'sovex',
    star: true,
    academy: 'academy_3',
};
const main = {
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
const second = buildGarantRow({
    catalog,
    regionCode: 'stv',
    withTax: false,
    key: 'r2',
    setId: 'general',
    role: 'additional',
    complectCode: 'ur',
    supplyCode: 'x_internet_7',
    contractCode: 'internet',
})!;
const general = upsertRow(upsertRow(createSet('general', 'general'), main), second);

describe('legacy-numbers', () => {
    it('коды → легаси-номера, X-ОД → номер ближайшей справочной', () => {
        expect(complectNumberOf('buh')).toBe(0);
        expect(complectNumberOf('exzak')).toBe(18);
        expect(contractNumberOf('abonYear')).toBe(3);
        expect(contractNumberOf('key')).toBe(9);
        expect(supplyNumberOf(catalog, catalog.supplies.byCode['internet_5']!)).toBe(4);
        expect(supplyNumberOf(catalog, catalog.supplies.byCode['proxima_flash']!)).toBe(10);
        const custom = { ...catalog.supplies.byCode['internet_5']!, code: 'x_internet_7', usersQuantity: 7 };
        expect(supplyNumberOf(catalog, custom)).toBe(4); // ближайшая снизу — 5 ОД
    });
});

describe('buildComplectGroups', () => {
    const groups = buildComplectGroups(catalog, composition);
    const group = (type: string) => groups.find(g => g.type === type);

    it('группы в легаси-порядке с легаси-названиями, только выбранное, checked=true', () => {
        expect(groups.map(g => g.type)).toEqual(['npa', 'la', 'cons', 'sp', 'free', 'er', 'per', 'consulting', 'lt', 'star', 'academy']);
        expect(group('npa')!.groupsName).toBe('Нормативно-правовые акты');
        expect(groups.every(g => g.value.every(block => block.checked))).toBe(true);
    });

    it('регион — блок isRegion в НПА; isLa-бесплатный — в судебной практике', () => {
        const npa = group('npa')!.value;
        expect(npa.map(b => b.code)).toEqual(['rus', 'reg', 'stv']);
        expect(npa.find(b => b.code === 'stv')?.isRegion).toBe(true);
        expect(npa.find(b => b.code === 'stv')?.weight).toBe(0.5);
        expect(group('la')!.value.map(b => b.code)).toEqual(['la', 'online2']);
        expect(group('free')!.value.map(b => b.code)).toEqual(['praim']);
    });

    it('LT: сервисы + пакет по весу; консалтинг: горячая линия (withConsalting) + платный', () => {
        const lt = group('lt')!.value.map(b => b.code);
        expect(lt).toEqual(['ltsut', 'ltconstructor', 'ltdisk', 'ltconnect', 'ltpackSmall']);
        expect(group('consulting')!.value.map(b => b.code)).toContain('sovex');
        expect(group('academy')!.value[0]!.code).toBe('academy_3');
    });
});

describe('строки и сеты', () => {
    it('договор и поставка в легаси-форме с номерами и кодом', () => {
        const contract = toDocContract(catalog.contracts.byCode['abonYear']!);
        expect(contract.number).toBe(3);
        expect(contract.prepayment).toBe(12);
        expect(contract.itemId).toBe(catalog.contracts.byCode['abonYear']!.bitrixItemId);
        expect(contract.measureCode).toBe(catalog.contracts.byCode['abonYear']!.measure.code);
        const supply = toDocSupply(catalog, catalog.supplies.byCode['internet_5']!);
        expect(supply).toMatchObject({ code: 'internet_5', number: 4, usersQuantity: 5, type: 'internet' });
    });

    it('главная строка — id 0, цены 1:1, product с номерами комплекта/поставки', () => {
        const row = toDocRow(catalog, main, 'general', 0, 0);
        expect(row.id).toBe(0);
        expect(row.price.default).toBe(main.price.base);
        expect(row.price.discount.precent).toBe(main.price.discount.percent);
        expect(row.price.measure.contractNumber).toBe(3);
        expect(row.product.complectNumber).toBe(0);
        expect(row.product.supplyNumber).toBe(4);
        expect(row.product.productId).toBe(catalog.contracts.byCode['abonYear']!.bitrixItemId);
        expect(row.currentSupply.code).toBe('internet_5');
        expect(row.supply?.forkp).toBe(catalog.supplies.byCode['internet_5']!.quantityForKp);
    });

    it('сеты: general с total, развёрнутый/свёрнутый флаг, X-ОД второй строки без падения', () => {
        const sets = toDocRowSets(catalog, general, []);
        expect(sets.general).toHaveLength(1);
        expect(sets.general[0]!.rows.garant).toHaveLength(2);
        expect(sets.general[0]!.total).toHaveLength(1);
        expect(sets.general[0]!.show).toBe(false);
        expect(sets.general[0]!.rows.garant[1]!.product.supplyNumber).toBe(4);
        expect(sets.alternative).toEqual([]);
    });
});

describe('buildOfferPayload', () => {
    it('собирает запрос КП целиком; без главной строки — null', () => {
        const payload = buildOfferPayload({
            domain: 'gsr.bitrix24.ru',
            dealId: 129487,
            companyId: 95817,
            userId: 447,
            providerId: 1,
            templateId: '12',
            clientType: 'org',
            catalog,
            general,
            alternative: [],
            recipient: { name: '', inn: '', companyName: '', position: '', positionCase: '', nameCase: '' },
            manager: { name: 'Иван', email: '', phone: '', position: '' },
            invoice: {
                needGeneralInvoice: false,
                needManyInvoices: false,
                isByPresentationInvoices: false,
                invoiceDate: '',
                invoiceNumber: '',
            },
        })!;
        expect(payload.contractType).toBe('abon');
        expect(payload.dealId).toBe('129487');
        expect(payload.complect.length).toBeGreaterThan(5);
        expect(payload.rows).toHaveLength(2);
        expect(payload.total.id).toBe(0);
        expect(payload.supply.code).toBe('internet_5');
        expect(payload.withoutQueue).toBe(false);
        expect(
            buildOfferPayload({
                domain: 'd',
                dealId: 1,
                companyId: 1,
                userId: 1,
                providerId: 1,
                templateId: '1',
                clientType: 'org',
                catalog,
                general: createSet('general', 'general'),
                alternative: [],
                recipient: payload.recipient,
                manager: payload.manager,
                invoice: payload.invoice,
            }),
        ).toBeNull();
    });
});
