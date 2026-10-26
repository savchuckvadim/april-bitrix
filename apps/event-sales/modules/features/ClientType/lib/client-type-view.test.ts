import { describe, expect, it } from 'vitest';
import { buildClientTypeView, clientTypeName } from './client-type-view';

/**
 * Слепок как на garant 26.10.2026: у сделки и компании id вариантов
 * РАЗНЫЕ — «Коммерческие» 5475 у сделки и 5697 у компании.
 */
const field = (ids: Record<string, number>) => ({
    code: 'op_client_type',
    bitrixId: 'OP_CLIENT_TYPE',
    items: Object.entries(ids).map(([code, bitrixId]) => ({
        code,
        bitrixId,
        name: { state: 'Бюджетники', commerc: 'Коммерческие', ip: 'ИП' }[code],
    })),
});
const dealFields = [field({ state: 5473, commerc: 5475, ip: 5477 })] as never;
const companyFields = [field({ state: 5695, commerc: 5697, ip: 5699 })] as never;
const UF = 'UF_CRM_OP_CLIENT_TYPE';

const view = (
    deal: Record<string, unknown> | null,
    company: Record<string, unknown> | null,
    saved: Parameters<typeof buildClientTypeView>[0]['saved'] = null,
) => buildClientTypeView({ dealFields, companyFields, deal, company, saved });

describe('buildClientTypeView', () => {
    it('одинаковый тип с разными id у сделки и компании — не конфликт', () => {
        const result = view({ [UF]: '5475' }, { [UF]: '5697' });
        expect(result).toMatchObject({
            available: true,
            current: 'commerc',
            deal: 'commerc',
            company: 'commerc',
            conflict: false,
        });
        expect(result.options.map(option => option.code)).toEqual([
            'state',
            'commerc',
            'ip',
        ]);
    });

    it('показывается тип компании, без него — сделки', () => {
        expect(view({ [UF]: '5477' }, {}).current).toBe('ip');
        expect(view({ [UF]: '5477' }, { [UF]: '5695' }).current).toBe('state');
    });

    it('разные типы — конфликт', () => {
        expect(view({ [UF]: '5477' }, { [UF]: '5695' }).conflict).toBe(true);
    });

    it('записанное в этой сессии важнее строк сущностей', () => {
        const result = view({ [UF]: '5477' }, { [UF]: '5695' }, {
            deal: 'commerc',
            company: 'commerc',
        });
        expect(result).toMatchObject({ current: 'commerc', conflict: false });
    });

    it('поля нет у открытых сущностей — чипа нет', () => {
        expect(
            buildClientTypeView({
                dealFields: [] as never,
                companyFields: [] as never,
                deal: {},
                company: null,
                saved: null,
            }).available,
        ).toBe(false);
    });

    it('подпись варианта по коду', () => {
        const { options } = view({}, {});
        expect(clientTypeName(options, 'ip')).toBe('ИП');
        expect(clientTypeName(options, null)).toBe('');
    });
});
