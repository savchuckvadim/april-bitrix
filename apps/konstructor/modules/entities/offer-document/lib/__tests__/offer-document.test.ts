import { describe, expect, it } from 'vitest';
import { selectParticipants } from '../../../complect-variant/lib/participants';
import { COMPLECT_VARIANT_STAGE, type ComplectVariantStage } from '../../../complect-variant/lib/stage';
import {
    COMPLECT_MODE,
    type ComplectMode,
    type ComplectVariantRecordDto,
} from '../../../complect-variant/model/dto';
import { RQ_TYPE } from '../../../bx-rq/model/types';
import type { PBXField } from '../../../portal';
import { buildGarantRow, createSet, upsertRow, type RowSet } from '../../../row-set';
import { toOfferClientType } from '../client-type.util';
import { resolveInvoiceDefaults, resolveRecipientDefaults, toInputDate } from '../document-defaults.util';
import { managerFromBxUser } from '../manager.util';
import { buildVariantsPayload } from '../build-variants-payload';
import {
    mainSetOf,
    recordOf,
    snapshotRowsOf,
    variantCatalog as catalog,
    variantItems as items,
} from '../__fixtures__/variant-records';

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
    const stageOf = (id: number | null) =>
        id === 101
            ? COMPLECT_VARIANT_STAGE.current
            : id === 103
              ? COMPLECT_VARIANT_STAGE.rejected
              : COMPLECT_VARIANT_STAGE.draft;
    const draftsOnly = () => COMPLECT_VARIANT_STAGE.draft;
    const emptyLive = { general: createSet('general', 'general'), alternative: [] };

    /** Сборка участников: правило участия применяет selectParticipants, как это делает селектор. */
    const payloadOf = (
        records: ComplectVariantRecordDto[],
        options: {
            stages?: (id: number | null) => ComplectVariantStage;
            mode?: ComplectMode;
            openVariantSmartId?: number | null;
            live?: { general: RowSet; alternative: RowSet[] };
        } = {},
    ) => {
        const { stages = draftsOnly, mode = COMPLECT_MODE.multi_contract, openVariantSmartId = null } = options;
        return buildVariantsPayload({
            catalog,
            participants: selectParticipants(records, stages, mode, openVariantSmartId),
            items,
            openVariantSmartId,
            live: options.live ?? emptyLive,
        });
    };

    it('все варианты: участвуют все незакрытые, открытый вариант печатается из живого состояния, не из слепка', () => {
        const live = { general: mainSetOf('live', 'ur'), alternative: [] };
        const { variants, skipped } = payloadOf(
            [recordOf(1, 101, 'buh'), recordOf(2, 102, 'buh'), recordOf(3, 103, 'buh')],
            { stages: stageOf, openVariantSmartId: 101, live },
        );
        // 103 отклонён и не участвует; 101 открыт и печатается из live (комплект ur), 102 из слепка
        expect(variants.map(v => v.title)).toEqual(['Бухгалтеру', 'Юристу']);
        expect(variants[0]!.variantSmartId).toBe(101);
        expect(variants[0]!.rows[0]!.product.name).toBe(catalog.complects.byCode['ur']!.fullTitle);
        expect(variants[1]!.rows[0]!.product.name).toBe(catalog.complects.byCode['buh']!.fullTitle);
        expect(skipped).toEqual([]);
    });

    it('только открытый вариант: в документ идёт один вариант, открытый, из живого состояния', () => {
        const live = { general: mainSetOf('live', 'ur'), alternative: [] };
        const { variants, entries, skipped } = payloadOf(
            [recordOf(1, 101, 'buh'), recordOf(2, 102, 'buh')],
            { mode: COMPLECT_MODE.compare, stages: stageOf, openVariantSmartId: 101, live },
        );
        expect(variants.map(v => v.title)).toEqual(['Бухгалтеру']);
        expect(variants[0]!.rows[0]!.product.name).toBe(catalog.complects.byCode['ur']!.fullTitle);
        expect(entries.map(entry => entry.isOpen)).toEqual([true]);
        expect(skipped).toEqual([]);
    });

    it('по одному без открытого варианта: вариантов в документе нет', () => {
        const { variants, entries, skipped } = payloadOf(
            [recordOf(1, 101, 'buh'), recordOf(2, 102, 'buh')],
            { mode: COMPLECT_MODE.compare, stages: stageOf },
        );
        expect(variants).toEqual([]);
        expect(entries).toEqual([]);
        expect(skipped).toEqual([]);
    });

    it('только открытый вариант: нечитаемый слепок другого варианта документ не блокирует', () => {
        const { variants, skipped } = payloadOf(
            [recordOf(1, 102, 'buh'), recordOf(2, 105, 'buh', '{broken')],
            {
                mode: COMPLECT_MODE.compare,
                openVariantSmartId: 102,
                live: { general: mainSetOf('live', 'buh'), alternative: [] },
            },
        );
        expect(variants.map(v => v.title)).toEqual(['Юристу']);
        expect(skipped).toEqual([]);
    });

    it('стадий никто не трогал — читаемые слепки собираются как раньше', () => {
        const { variants, skipped } = payloadOf([recordOf(1, 102, 'buh'), recordOf(2, 104, 'ur')]);
        expect(variants.map(v => v.title)).toEqual(['Юристу', 'Вариант 104']);
        expect(variants[1]!.contractType).toBe('abon');
        expect(variants[1]!.sets.general[0]!.rows.garant).toHaveLength(1);
        expect(skipped).toEqual([]);
    });

    it('нечитаемый слепок попадает в skipped с причиной, читаемые варианты остаются', () => {
        const { variants, skipped } = payloadOf([
            recordOf(1, 102, 'buh'),
            recordOf(3, 105, 'buh', '{broken'),
            recordOf(4, 106, 'buh', null),
        ]);
        expect(variants.map(v => v.title)).toEqual(['Юристу']);
        expect(skipped).toEqual([
            { variantSmartId: 105, title: 'Вариант 105', reason: 'snapshotUnreadable' },
            { variantSmartId: 106, title: 'Вариант 106', reason: 'snapshotUnreadable' },
        ]);
    });

    it('слепок без главной строки попадает в skipped с причиной noMainRow и названием из смарта', () => {
        const { variants, skipped } = payloadOf([
            recordOf(1, 102, 'buh', snapshotRowsOf(createSet('general', 'general'))),
        ]);
        expect(variants).toEqual([]);
        expect(skipped).toEqual([{ variantSmartId: 102, title: 'Юристу', reason: 'noMainRow' }]);
    });

    it('договор главной строки, которого нет в каталоге, даёт причину noMainRow', () => {
        const main = mainSetOf('v1', 'buh').rows[0]!;
        const broken = upsertRow(createSet('general', 'general'), {
            ...main,
            refs: { ...main.refs, contractCode: 'no-such-contract' },
        });
        const { variants, skipped } = payloadOf([recordOf(1, 102, 'buh', snapshotRowsOf(broken))]);
        expect(variants).toEqual([]);
        expect(skipped.map(entry => entry.reason)).toEqual(['noMainRow']);
    });

    it('договор дополнительной строки вне каталога: сборка выбрасывает ошибку, участник идёт в skipped', () => {
        const main = mainSetOf('v1', 'buh').rows[0]!;
        const extra = buildGarantRow({
            catalog,
            regionCode: 'stv',
            withTax: false,
            key: 'v1_extra',
            setId: 'general',
            role: 'additional',
            complectCode: 'ur',
            supplyCode: 'internet_5',
            contractCode: 'abonYear',
        })!;
        const general = upsertRow(
            upsertRow(createSet('general', 'general'), main),
            { ...extra, refs: { ...extra.refs, contractCode: 'no-such-contract' } },
        );
        const { variants, skipped } = payloadOf([recordOf(1, 102, 'buh', snapshotRowsOf(general))]);
        expect(variants).toEqual([]);
        expect(skipped).toEqual([{ variantSmartId: 102, title: 'Юристу', reason: 'noMainRow' }]);
    });

    it('открытый вариант с пустым живым набором идёт в skipped даже при читаемом слепке записи', () => {
        const { variants, skipped } = payloadOf([recordOf(1, 101, 'buh')], {
            stages: stageOf,
            openVariantSmartId: 101,
        });
        expect(variants).toEqual([]);
        expect(skipped).toEqual([{ variantSmartId: 101, title: 'Бухгалтеру', reason: 'noMainRow' }]);
    });

    it('вариант в финальной стадии не участвует: битый слепок отклонённого варианта не попадает в skipped', () => {
        const { variants, skipped } = payloadOf(
            [recordOf(1, 102, 'buh'), recordOf(3, 103, 'buh', '{broken')],
            { stages: stageOf },
        );
        expect(variants.map(v => v.title)).toEqual(['Юристу']);
        expect(skipped).toEqual([]);
    });
});
