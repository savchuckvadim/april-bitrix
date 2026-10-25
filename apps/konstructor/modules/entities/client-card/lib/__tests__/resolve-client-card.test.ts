import { describe, expect, it } from 'vitest';
import { resolveClientCard, type ClientCardInput } from '../resolve-client-card.util';

type Fields = NonNullable<ClientCardInput['companyFields']>;

const fields = [
    {
        code: 'op_prospects',
        bitrixId: 'OP_PROSPECTS',
        items: [
            { code: 'red', name: 'Красный', bitrixId: 11 },
            { code: 'green', name: 'Зелёный', bitrixId: 12 },
        ],
    },
    {
        code: 'op_client_status',
        bitrixId: 'OP_CLIENT_STATUS',
        items: [{ code: 'active', name: 'Действующий', bitrixId: 21 }],
    },
    { code: 'op_inn', bitrixId: 'OP_INN', items: [] },
] as unknown as Fields;

const base: ClientCardInput = {
    domain: 'gsr.bitrix24.ru',
    company: {
        ID: 7,
        TITLE: 'ООО Ромашка',
        UF_CRM_OP_PROSPECTS: '12',
        UF_CRM_OP_CLIENT_STATUS: '21',
        UF_CRM_OP_INN: ' 7701234567 ',
    } as unknown as ClientCardInput['company'],
    deal: { ID: 129487 },
    dealId: 129487,
    companyFields: fields,
};

describe('resolveClientCard', () => {
    it('компания и сделка — ссылками на карточки CRM', () => {
        const card = resolveClientCard(base);
        expect(card.company).toEqual({
            title: 'ООО Ромашка',
            href: 'https://gsr.bitrix24.ru/crm/company/details/7/',
        });
        expect(card.deal?.href).toBe(
            'https://gsr.bitrix24.ru/crm/deal/details/129487/',
        );
    });

    it('прогноз, статус и ИНН — по pbx-кодам через слепок портала', () => {
        const card = resolveClientCard(base);
        expect(card.prospect?.current).toBe('green');
        expect(card.status?.currentName).toBe('Действующий');
        expect(card.inn).toBe('7701234567');
    });

    it('полей нет на портале — блоки не показываются', () => {
        const card = resolveClientCard({ ...base, companyFields: [] as Fields });
        expect(card.prospect).toBeNull();
        expect(card.status).toBeNull();
        expect(card.inn).toBeUndefined();
    });

    it('без домена ссылок нет (dev вне фрейма), текст остаётся', () => {
        const card = resolveClientCard({ ...base, domain: null });
        expect(card.company?.href).toBeNull();
        expect(card.company?.title).toBe('ООО Ромашка');
    });
});
