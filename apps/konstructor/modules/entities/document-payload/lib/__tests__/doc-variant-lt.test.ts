import { describe, expect, it } from 'vitest';
import { buildContractLt } from '../../../contract-document/lib/contract-lt.util';
import { findMainRow } from '../../../row-set';
import { buildDocBody, buildDocVariant } from '../build-doc-body';
import { setComposition } from '../set-composition';
import { catalog, compositionOf, garantRowOf, syncedGeneral } from '../__fixtures__/two-garant-set';

/**
 * Участник КП несёт `lt`: бесплатную часть и платные пакеты Legal Tech в той же
 * форме, что `lt` формы договора. Одиночное КП (тело без участника) поля не имеет.
 */

const nameOf = (code: string) => catalog.services.lt.find(service => service.code === code)!.name;
const packageName = (weight: number) => catalog.services.ltPackages.find(pkg => pkg.weight === weight)!.fullName;

const variantOf = (
    rows: Parameters<typeof syncedGeneral>[0],
    serviceDepartment?: boolean,
    general = syncedGeneral(rows),
) => {
    const variant = buildDocVariant({
        catalog,
        general,
        alternative: [],
        variantSmartId: 7,
        title: 'Вариант',
        serviceDepartment,
    });
    if (!variant) throw new Error('участник не собрался');
    return variant;
};

const mainOf = (patch = {}) => garantRowOf('general_main', 'main', 'buh', compositionOf('buh', patch));

describe('buildDocVariant: платный Legal Tech участника', () => {
    it('вариант с платным пакетом несёт lt: бесплатная часть, пакет и его состав', () => {
        const variant = variantOf([mainOf({ lt: ['ltsut', 'ltconstructor'], ltInPacket: ['ltdisk', 'ltconnect'] })]);
        expect(variant.lt).toEqual({
            freePacket: packageName(2),
            freeServices: [nameOf('ltsut'), nameOf('ltconstructor')],
            paidPacket: packageName(2),
            paidServices: [nameOf('ltdisk'), nameOf('ltconnect')],
            paidPackets: [{ name: packageName(2), services: [nameOf('ltdisk'), nameOf('ltconnect')] }],
        });
    });

    it('lt совпадает с lt формы договора: тот же buildContractLt от объединённого наполнения набора', () => {
        const general = syncedGeneral([
            mainOf({ lt: ['ltsut'], ltInPacket: ['ltdisk', 'ltconnect'] }),
            garantRowOf('general_additional', 'additional', 'ur', compositionOf('ur', { lt: ['ltsut'] })),
        ]);
        const composition = setComposition(general, findMainRow(general));
        expect(composition).not.toBeNull();
        expect(variantOf([], false, general).lt).toEqual(buildContractLt(catalog, composition!, false));
    });

    it('без платных пакетов lt несёт пустой платный блок', () => {
        const { lt } = variantOf([mainOf({ lt: [], ltInPacket: [], ltOther: [] })]);
        expect(lt).toEqual({ freePacket: '', freeServices: [], paidPacket: '', paidServices: [], paidPackets: [] });
    });

    it('пакет веса 4 уходит в lt только у сервисного отдела', () => {
        const rows = [mainOf({ ltInPacket: ['ltdisk', 'ltconnect', 'ltbusiness', 'ltdocmail'] })];
        expect(variantOf(rows).lt?.paidPackets).toEqual([]);
        expect(variantOf(rows, false).lt?.paidPackets).toEqual([]);
        expect(variantOf(rows, true).lt?.paidPackets).toHaveLength(1);
    });

    it('доп. пакет без своей строки в наборе в lt не идёт, как и в группы инфоблоков', () => {
        const packet = { id: 'extra', services: ['ltdisk', 'ltconnect'], alternativeName: null };
        const general = syncedGeneral([mainOf({ ltOther: [packet] })]);
        expect(general.rows.some(row => row.productType === 'lt_other' && row.refs.packetId === 'extra')).toBe(true);
        expect(variantOf([], false, general).lt?.paidPackets).toEqual([
            { name: packageName(2), services: [nameOf('ltdisk'), nameOf('ltconnect')] },
        ]);

        const withoutRow = { ...general, rows: general.rows.filter(row => row.productType !== 'lt_other') };
        expect(variantOf([], false, withoutRow).lt?.paidPackets).toEqual([]);
    });

    it('тело одиночного КП поля lt не получает', () => {
        const body = buildDocBody({
            catalog,
            general: syncedGeneral([mainOf({ ltInPacket: ['ltdisk', 'ltconnect'] })]),
            alternative: [],
        });
        expect(body).not.toBeNull();
        expect(body).not.toHaveProperty('lt');
    });
});
