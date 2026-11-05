import { describe, expect, it } from 'vitest';
import { RQ_TYPE } from '../../../bx-rq/model/types';
import {
    getCompanyClientType,
    getDealClientType,
    resolveClientType,
    type ClientTypeInput,
} from '../utils/get-deal-client-type.util';

type Fields = NonNullable<ClientTypeInput['portalDeal']>['bitrixfields'];

const clientTypeField = (bitrixId: string): Fields =>
    [
        {
            code: 'op_client_type',
            bitrixId,
            items: [
                { code: 'commerc', name: 'Коммерческие', bitrixId: 31 },
                { code: 'ip', name: 'ИП', bitrixId: 32 },
                { code: 'layer', name: 'Адвокаты', bitrixId: 35 },
            ],
        },
    ] as unknown as Fields;

describe('resolveClientType', () => {
    const portalCompany = { bitrixfields: clientTypeField('OP_CLIENT_TYPE_C') };
    const portalDeal = { bitrixfields: clientTypeField('OP_CLIENT_TYPE_D') };

    it('компания первее сделки', () => {
        const resolved = resolveClientType({
            portalCompany,
            company: { UF_CRM_OP_CLIENT_TYPE_C: '32' },
            portalDeal,
            deal: { UF_CRM_OP_CLIENT_TYPE_D: '31' },
        });
        expect(resolved).toEqual({ type: RQ_TYPE.IP, source: 'company' });
    });

    it('в компании пусто — берётся сделка', () => {
        const resolved = resolveClientType({
            portalCompany,
            company: { UF_CRM_OP_CLIENT_TYPE_C: '' },
            portalDeal,
            deal: { UF_CRM_OP_CLIENT_TYPE_D: '31' },
        });
        expect(resolved).toEqual({ type: RQ_TYPE.ORGANIZATION, source: 'deal' });
    });

    it('нигде не задано или поля нет на портале — null', () => {
        expect(
            resolveClientType({ portalCompany, company: {}, portalDeal, deal: {} }),
        ).toEqual({ type: null, source: null });
        expect(
            resolveClientType({
                portalCompany: undefined,
                company: { UF_CRM_OP_CLIENT_TYPE_C: '32' },
                portalDeal: undefined,
                deal: null,
            }).type,
        ).toBeNull();
    });

    it('адвокаты — как физлицо; чужой bitrixId пункта — null', () => {
        expect(getCompanyClientType(portalCompany, { UF_CRM_OP_CLIENT_TYPE_C: 35 })).toBe(RQ_TYPE.FIZ);
        expect(getDealClientType(portalDeal, { UF_CRM_OP_CLIENT_TYPE_D: '999' })).toBeNull();
    });
});
