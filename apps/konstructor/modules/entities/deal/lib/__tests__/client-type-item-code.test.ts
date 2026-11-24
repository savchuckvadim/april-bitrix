import { describe, expect, it } from 'vitest';
import { RQ_TYPE } from '../../../bx-rq/model/types';
import {
    getClientTypeItemCode,
    readClientType,
    type ClientTypeInput,
} from '../utils/get-deal-client-type.util';

type Fields = NonNullable<ClientTypeInput['portalDeal']>['bitrixfields'];

const fields = [
    {
        code: 'op_client_type',
        bitrixId: 'OP_CLIENT_TYPE',
        items: [
            { code: 'commerc', name: 'Коммерческие', bitrixId: 31 },
            { code: 'ip', name: 'ИП', bitrixId: 32 },
            { code: 'state', name: 'Бюджетники', bitrixId: 33 },
            { code: 'fiz', name: 'Физ лицо', bitrixId: 34 },
            { code: 'layer', name: 'Адвокаты', bitrixId: 35 },
        ],
    },
] as unknown as Fields;

describe('getClientTypeItemCode', () => {
    it('тип реквизита → код значения op_client_type', () => {
        expect(getClientTypeItemCode(RQ_TYPE.ORGANIZATION)).toBe('commerc');
        expect(getClientTypeItemCode(RQ_TYPE.BUDGET)).toBe('state');
        expect(getClientTypeItemCode(RQ_TYPE.IP)).toBe('ip');
        expect(getClientTypeItemCode(RQ_TYPE.FIZ)).toBe('fiz');
    });

    it.each(Object.values(RQ_TYPE))(
        'код значения для %s читается обратно в тот же тип клиента',
        type => {
            const item = fields?.[0]?.items?.find(
                entry => entry.code === getClientTypeItemCode(type),
            );
            expect(item).toBeDefined();
            const entity = { UF_CRM_OP_CLIENT_TYPE: String(item?.bitrixId) };
            expect(readClientType(fields, entity)).toBe(type);
        },
    );
});
