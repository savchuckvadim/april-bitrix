import { describe, expect, it } from 'vitest';
import oldInit from '../../../catalog/lib/__fixtures__/oldinit.json';
import { catalogFromOldInit } from '../../../catalog';
import { COMPLECT_VARIANT_STAGE } from '../../../complect-variant/lib/stage';
import type { ComplectVariantRecordDto } from '../../../complect-variant/model/dto';
import { defaultComposition } from '../../../composition';
import { RQ_TYPE } from '../../../bx-rq/model/types';
import type { PBXField } from '../../../portal';
import { buildGarantRow, createSet, upsertRow } from '../../../row-set';
import { serializeV2 } from '../../../snapshot';
import { toOfferClientType } from '../client-type.util';
import { resolveInvoiceDefaults, resolveRecipientDefaults, toInputDate } from '../document-defaults.util';
import { managerFromBxUser } from '../manager.util';
import { buildVariantsPayload } from '../build-variants-payload';

const field = (code: string, bitrixId: string): PBXField => ({ code, bitrixId }) as PBXField;

describe('document-defaults', () => {
    const dealFields = [field('op_inn', '1'), field('op_name', '2'), field('op_position', '3'), field('first_pay_date', '4')];
    const companyFields = [field('op_inn', '10'), field('op_name', '20'), field('op_position', '30')];
    const company = { TITLE: 'ООО Ромашка', UF_CRM_10: '7700000000', UF_CRM_20: 'Петров Пётр', UF_CRM_30: 'Директор' };

    it('сделка в приоритете, компания — запасной источник; падеж до ответа равен исходнику', () => {
        const deal = { UF_CRM_1: ' 7701234567 ', UF_CRM_2: 'Иванов Иван Иванович', UF_CRM_3: '' };
        const recipient = resolveRecipientDefaults({ deal, company, dealFields, companyFields });
        expect(recipient).toEqual({
            companyName: 'ООО Ромашка',
            inn: '7701234567',
            name: 'Иванов Иван Иванович',
            nameCase: 'Иванов Иван Иванович',
            position: 'Директор',
            positionCase: 'Директор',
        });
    });

    it('полей на портале нет — пустая шапка с названием компании', () => {
        const recipient = resolveRecipientDefaults({ deal: null, company, dealFields: null, companyFields: null });
        expect(recipient.companyName).toBe('ООО Ромашка');
        expect(recipient.inn).toBe('');
        expect(recipient.name).toBe('');
    });

    it('дата первой оплаты → input[type=date]; «N»/мусор — пусто', () => {
        expect(toInputDate('2026-11-05T03:00:00+03:00')).toBe('2026-11-05');
        expect(toInputDate('N')).toBe('');
        expect(toInputDate('вчера')).toBe('');
        expect(
            resolveInvoiceDefaults({ deal: { UF_CRM_4: '2026-11-05T03:00:00+03:00' }, dealFields }),
        ).toEqual({ invoiceDate: '2026-11-05', invoiceNumber: '' });
    });
});

describe('manager / clientType', () => {
    it('менеджер из пользователя Битрикса, телефон — рабочий или мобильный', () => {
        expect(
            managerFromBxUser({ NAME: 'Анна', LAST_NAME: 'Смирнова', EMAIL: 'a@april.ru', PERSONAL_MOBILE: '+7 900', WORK_POSITION: 'Менеджер' }),
        ).toEqual({ name: 'Анна Смирнова', email: 'a@april.ru', phone: '+7 900', position: 'Менеджер' });
        expect(managerFromBxUser(null).name).toBe('');
    });

    it('RQ_TYPE → clientType payload; неизвестно — организация', () => {
        expect(toOfferClientType(RQ_TYPE.BUDGET)).toBe('org_state');
        expect(toOfferClientType(RQ_TYPE.IP)).toBe('ip');
        expect(toOfferClientType(null)).toBe('org');
    });
});

describe('buildVariantsPayload', () => {
    const catalog = catalogFromOldInit(oldInit);
    const rowFor = (key: string, complectCode: string) => ({
        ...buildGarantRow({
            catalog,
            regionCode: 'stv',
            withTax: false,
            key,
            setId: 'general',
            role: 'main' as const,
            complectCode,
            supplyCode: 'internet_5',
            contractCode: 'abonYear',
        })!,
        composition: defaultComposition(catalog.complects.byCode[complectCode]!),
    });
    const setOf = (key: string, complectCode: string) =>
        upsertRow(createSet('general', 'general'), rowFor(key, complectCode));
    const recordOf = (id: number, variantSmartId: number, complectCode: string, rows?: string | null): ComplectVariantRecordDto =>
        ({
            id,
            variantSmartId,
            rows:
                rows === undefined
                    ? JSON.stringify(
                          serializeV2({
                              state: {
                                  regionCode: 'stv',
                                  contractCode: 'abonYear',
                                  supplyCode: 'internet_5',
                                  general: setOf(`v${id}`, complectCode),
                                  alternative: [],
                                  templateId: null,
                              },
                              dealId: 1,
                              domain: 'd',
                              userId: 1,
                              savedAt: '2026-10-24T00:00:00.000Z',
                          }),
                      )
                    : rows,
        }) as ComplectVariantRecordDto;
    const items = [
        { id: 101, title: 'Бухгалтеру', stageId: 'DT1:CURRENT' },
        { id: 102, title: 'Юристу', stageId: 'DT1:NEW' },
        { id: 103, title: 'Отклонённый', stageId: 'DT1:REJECTED' },
    ];
    const stageOf = (id: number | null) =>
        id === 101
            ? COMPLECT_VARIANT_STAGE.current
            : id === 103
              ? COMPLECT_VARIANT_STAGE.rejected
              : COMPLECT_VARIANT_STAGE.draft;

    it('участники по стадиям; открытый вариант — из живого состояния, не из слепка', () => {
        const live = { general: setOf('live', 'ur'), alternative: [] };
        const variants = buildVariantsPayload({
            catalog,
            records: [recordOf(1, 101, 'buh'), recordOf(2, 102, 'buh'), recordOf(3, 103, 'buh')],
            items,
            stageOf,
            openVariantSmartId: 101,
            live,
        });
        // помечен «Текущий» только 101 — участвует он один, и печатается из live (комплект ur)
        expect(variants.map(v => v.title)).toEqual(['Бухгалтеру']);
        expect(variants[0]!.variantSmartId).toBe(101);
        expect(variants[0]!.rows[0]!.product.name).toBe(catalog.complects.byCode['ur']!.fullTitle);
    });

    it('стадий никто не трогал — участвуют все читаемые слепки; битый пропускается', () => {
        const variants = buildVariantsPayload({
            catalog,
            records: [recordOf(1, 102, 'buh'), recordOf(2, 104, 'ur'), recordOf(3, 105, 'buh', '{broken')],
            items,
            stageOf: () => COMPLECT_VARIANT_STAGE.draft,
            openVariantSmartId: null,
            live: { general: createSet('general', 'general'), alternative: [] },
        });
        expect(variants.map(v => v.title)).toEqual(['Юристу', 'Вариант 104']);
        expect(variants[1]!.contractType).toBe('abon');
        expect(variants[1]!.sets.general[0]!.rows.garant).toHaveLength(1);
    });
});
