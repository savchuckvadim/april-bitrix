import { describe, expect, it } from 'vitest';
import {
    catalog,
    compositionOf,
    garantRowOf,
    syncedGeneral,
} from '@/modules/entities/document-payload/lib/__fixtures__/two-garant-set';
import { buildDealSendRequest } from '../build-deal-send.util';

/**
 * Поля сделки по общему набору: инфоблочные собираются из объединённого
 * наполнения всех комплектов, продуктовые остаются у главной строки.
 */

const main = garantRowOf(
    'general_main',
    'main',
    'buh',
    compositionOf('buh', { infoblocks: ['rus', 'reg', 'bbu'], lt: ['ltsut'], freeBlocks: ['praim'] }),
);
const additional = garantRowOf(
    'general_additional',
    'additional',
    'ur',
    compositionOf('ur', {
        infoblocks: ['rus', 'la', 'ntss'],
        lt: ['ltconstructor'],
        freeBlocks: ['praim', 'archives'],
        consalting: 'sovex',
    }),
);

const nameOf = (code: string) => catalog.infoblocks[code]!.name;
const fieldValue = (
    fields: Array<{ code: string; appType?: string; value: unknown }>,
    code: string,
    appType?: string,
) => fields.find(item => item.code === code && (!appType || item.appType === appType))?.value;

describe('deal-send: общий набор с дополнительным комплектом', () => {
    const general = syncedGeneral([main, additional]);
    const request = buildDealSendRequest({
        domain: 'gsr.bitrix24.ru',
        dealId: null,
        userId: 447,
        companyId: 95817,
        dealName: 'Тест',
        catalog,
        general,
        mainRow: main,
    });

    it('инфоблочные поля содержат блоки обеих строк без повторов', () => {
        expect(fieldValue(request.fields, 'npa')).toEqual([nameOf('rus'), nameOf('reg')]);
        expect(fieldValue(request.fields, 'la')).toEqual([nameOf('la')]);
        expect(fieldValue(request.fields, 'c')).toEqual([nameOf('bbu')]);
        expect(fieldValue(request.fields, 'sp')).toEqual([nameOf('ntss')]);
        expect(fieldValue(request.fields, 'free_blocks')).toEqual([nameOf('praim'), nameOf('archives')]);
        const lt = catalog.services.lt;
        expect(fieldValue(request.fields, 'lt')).toEqual(
            ['ltsut', 'ltconstructor'].map(code => lt.find(service => service.code === code)!.name),
        );
        expect(fieldValue(request.fields, 'consalting', 'update')).toEqual([
            catalog.services.consalting.find(service => service.code === 'sovex')!.name,
        ]);
    });

    it('продуктовые поля остаются от главной строки', () => {
        expect(fieldValue(request.fields, 'complect_name')).toBe(catalog.complects.byCode['buh']!.fullTitle);
        expect(fieldValue(request.fields, 'supply')).toBe('Интернет 5 ОД');
        // платный консалтинг только у дополнительной строки: продуктового поля у главной нет
        expect(fieldValue(request.fields, 'consalting', 'product')).toBeUndefined();
    });

    it('товарные строки набора — все строки general', () => {
        expect(request.productRows?.length).toBeGreaterThanOrEqual(3);
    });
});
