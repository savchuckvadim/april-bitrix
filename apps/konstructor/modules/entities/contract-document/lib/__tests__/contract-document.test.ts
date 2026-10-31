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
    const nameOf = (code: string) => catalog.services.lt.find(service => service.code === code)!.name;
    const nameOfPackage = (weight: number) =>
        catalog.services.ltPackages.find(pkg => pkg.weight === weight)!.fullName;
    const base = {
        ...defaultComposition(complect),
        lt: ['ltsut', 'ltconstructor'],
    };

    it('бесплатная часть и один платный пакет: состав списком сервисов', () => {
        const lt = buildContractLt(catalog, { ...base, ltInPacket: ['ltdisk', 'ltconnect'] });
        expect(lt.freePacket).toBe(nameOfPackage(2));
        expect(lt.freeServices).toEqual([nameOf('ltsut'), nameOf('ltconstructor')]);
        expect(lt.paidPacket).toBe(nameOfPackage(2));
        expect(lt.paidServices).toEqual([nameOf('ltdisk'), nameOf('ltconnect')]);
    });

    it('несколько платных: у каждого пакета свой состав, имя каталожное', () => {
        const lt = buildContractLt(catalog, {
            ...base,
            ltInPacket: ['ltdisk', 'ltconnect'],
            ltOther: [{ id: 'x', services: ['iscra'], alternativeName: 'Своё имя' }],
        });
        expect(lt.paidPacket).toBe(`${nameOfPackage(2)}, ${nameOfPackage(2)}`);
        expect(lt.paidServices).toEqual([
            `${nameOfPackage(2)}: ${nameOf('ltdisk')}, ${nameOf('ltconnect')}`,
            `${nameOfPackage(2)}: ${nameOf('iscra')}`,
        ]);
    });

    it('несобранные пакеты в договор не идут (легаси пропускал)', () => {
        const lt = buildContractLt(catalog, {
            ...base,
            ltInPacket: ['ltdisk'],
            ltOther: [{ id: 'x', services: ['ltconnect'], alternativeName: null }],
        });
        expect(lt.paidPacket).toBe('');
        expect(lt.paidServices).toEqual([]);
    });

    it('доп. пакет без основного платного', () => {
        const lt = buildContractLt(catalog, {
            ...base,
            ltOther: [{ id: 'x', services: ['ltdisk', 'ltconnect'], alternativeName: null }],
        });
        expect(lt.paidPacket).toBe(nameOfPackage(2));
        expect(lt.paidServices).toEqual([nameOf('ltdisk'), nameOf('ltconnect')]);
    });

    it('пакет веса 4 — только сервисному отделу', () => {
        const composition = {
            ...base,
            ltInPacket: ['ltdisk', 'ltconnect', 'ltbusiness', 'ltdocmail'],
        };
        expect(buildContractLt(catalog, composition).paidPacket).toBe('');
        expect(buildContractLt(catalog, composition, true).paidPacket).not.toBe('');
    });

    it('без LT — пусто, платного пакета нет', () => {
        const lt = buildContractLt(catalog, { ...defaultComposition(complect), lt: [] });
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
