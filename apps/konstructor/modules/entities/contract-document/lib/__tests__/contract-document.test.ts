import { describe, expect, it } from 'vitest';
import oldInit from '../../../catalog/lib/__fixtures__/oldinit.json';
import { catalogFromOldInit } from '../../../catalog';
import { defaultComposition } from '../../../composition';
import { CONTRACT_RQ_GROUP, RQ_TYPE, type RqRecord } from '../../../bx-rq/model/types';
import { buildGarantRow } from '../../../row-set';
import { buildContractLt } from '../contract-lt.util';
import { missingDealFields, missingRequisites, toBitrixDate } from '../contract-validation';
import { buildDocRegions } from '../doc-regions.util';
import { toContractBxRq } from '../to-contract-bx-rq.util';

const catalog = catalogFromOldInit(oldInit);
const complect = catalog.complects.byCode['buh']!;

describe('buildContractLt', () => {
    it('бесплатные LT — сервисы и пакет по их весу; платные — ltInPacket + «другой LT» строк', () => {
        const composition = {
            ...defaultComposition(complect),
            lt: ['ltsut', 'ltconstructor'],
            ltInPacket: ['ltdisk', 'ltconnect'],
        };
        const otherRow = {
            ...buildGarantRow({
                catalog,
                regionCode: 'stv',
                withTax: false,
                key: 'o',
                setId: 'general',
                role: 'additional' as const,
                complectCode: 'buh',
                supplyCode: 'internet_5',
                contractCode: 'abonYear',
            })!,
            productType: 'lt_other' as const,
            names: { name: 'Экспресс Проверка', shortName: 'ЭП', alternativeName: null },
        };
        const lt = buildContractLt(catalog, composition, [otherRow]);
        const nameOf = (code: string) => catalog.services.lt.find(service => service.code === code)!.name;
        expect(lt.freeServices).toEqual([nameOf('ltsut'), nameOf('ltconstructor')]);
        expect(lt.paidServices.slice(0, 2)).toEqual([nameOf('ltdisk'), nameOf('ltconnect')]);
        expect(lt.freePacket).not.toBe('');
        expect(lt.paidServices.slice(-1)).toEqual(['Экспресс Проверка']);
        expect(lt.paidPacket).not.toBe('');
    });

    it('без LT — пусто, платного пакета нет', () => {
        const lt = buildContractLt(catalog, defaultComposition(complect), []);
        expect(lt).toEqual({ freePacket: '', freeServices: [], paidPacket: '', paidServices: [] });
    });
});

describe('buildDocRegions', () => {
    it('регионы комплекта → inComplect с названием инфоблока; неизвестный код пропускается', () => {
        const regions = buildDocRegions(catalog, { ...defaultComposition(complect), regions: ['stv', 'nope'] });
        expect(regions.inComplect).toHaveLength(1);
        expect(regions.inComplect[0]).toMatchObject({ name: 'stv', infoblock: catalog.regions.byCode['stv']!.title });
        expect(regions.favorite).toEqual([]);
    });
});

describe('contract-validation', () => {
    it('обязательные поля сделки по подписям; пробелы — пусто', () => {
        expect(missingDealFields({ contract_start: '2026-11-01', contract_end: ' ', garant_client_assigned_name: '' })).toEqual([
            'Действие договора по',
            'Ответственный за получение справочника',
        ]);
        expect(toBitrixDate(' 2026-11-01 ')).toBe('2026-11-01');
    });

    it('реквизит не выбран — одна общая строка', () => {
        expect(missingRequisites(RQ_TYPE.ORGANIZATION, null)).toEqual(['Реквизиты клиента не выбраны']);
    });
});

describe('toContractBxRq', () => {
    const field = (code: string, value: string | null, group: CONTRACT_RQ_GROUP) => ({
        type: 'string' as const,
        name: code,
        value: value ?? '',
        code,
        isRequired: true,
        includes: [RQ_TYPE.ORGANIZATION],
        group,
        isActive: true,
        isDisable: false,
        order: 0,
    });
    const record: RqRecord = {
        bx_id: 7,
        preset_id: 1,
        type: RQ_TYPE.ORGANIZATION,
        fields: [field('inn', '7701', CONTRACT_RQ_GROUP.RQ)],
        address: {
            items: [{ anchor_id: 7, type_id: 6, name_type: 'Юридический адрес', fields: [field('address_city', 'Москва', CONTRACT_RQ_GROUP.ADDRESS)] }],
            current: null,
        },
        bank: { items: [], current: null, fields: [] },
    };

    it('поля, адреса и банк в форме BxRqDto; банка нет — пустой объект', () => {
        const dto = toContractBxRq(record);
        expect(dto.preset_id).toBe(1);
        expect(dto.fields[0]).toMatchObject({ code: 'inn', value: '7701', group: 'rq' });
        expect(dto.address.items[0]!.fields[0]).toMatchObject({ code: 'address_city', group: 'address' });
        expect(dto.bank.current).toEqual({ id: 0, fields: [] });
    });
});
