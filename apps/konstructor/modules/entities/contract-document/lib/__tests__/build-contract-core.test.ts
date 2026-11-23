import { describe, expect, it } from 'vitest';
import type { IBXCompany, IBXDeal } from '@bitrix/domain';
import { appActions, appReducer } from '@/modules/app/model/AppSlice';
import type { RootState } from '@/modules/app/model/store';
import type { RqRecord } from '../../../bx-rq/model/types';
import { RQ_TYPE } from '../../../bx-rq/model/types';
import { toOfferClientType } from '../../../offer-document';
import { rootStateWith } from '../../../document-payload/lib/__fixtures__/root-state';
import {
    catalog,
    compositionOf,
    garantRowOf,
    syncedGeneral,
} from '../../../document-payload/lib/__fixtures__/two-garant-set';
import { contractDocumentActions, contractDocumentReducer } from '../../model/ContractDocumentSlice';
import type { ContractSpecificationItem } from '../../model/dto';
import { buildContractGenerateCore, buildSpecificationFormCore } from '../build-contract-core';
import { buildContractGenerateRequest, buildSpecificationFormRequest } from '../build-contract-request';

/**
 * Ядро сборки запросов договора не знает про стор: живое состояние идёт через
 * тонкие обёртки, и их результат равен результату ядра на тех же данных.
 */

const main = garantRowOf(
    'general_main',
    'main',
    'buh',
    compositionOf('buh', { infoblocks: ['rus'], lt: ['ltsut'], regions: ['stv'] }),
);
const additional = garantRowOf(
    'general_additional',
    'additional',
    'ur',
    compositionOf('ur', {
        infoblocks: ['la'],
        regions: ['spb'],
        ltOther: [{ id: 'extra', services: ['ltdisk', 'ltconnect'], alternativeName: null }],
    }),
);

const specificationItem: ContractSpecificationItem = {
    type: 'string',
    name: 'Поставка',
    isRequired: false,
    includes: [],
    group: 'specification',
    isActive: true,
    isDisable: false,
    order: 1,
    value: 'спецификация',
    code: 'specification_supply',
};

const requisite: RqRecord = {
    bx_id: 7,
    preset_id: 1,
    type: RQ_TYPE.ORGANIZATION,
    fields: [],
    address: { items: [], current: null },
    bank: { items: [], current: null, fields: [] },
};

const deal: IBXDeal = {
    ID: 129487,
    TITLE: 'Сделка',
    CATEGORY_ID: '0',
    STAGE_ID: 'NEW',
    COMPANY_ID: '77',
    COMMENTS: '',
    ASSIGNED_BY_ID: '5',
    CREATED_BY_ID: '5',
};

const company: IBXCompany = {
    ID: 77,
    TITLE: 'Клиент',
    ASSIGNED_BY_ID: '6',
    UF_CRM_PRES_COUNT: 0,
    UF_CRM_USER_CARDNUM: '',
    COMMENTS: '',
};

/** Состояние с данными Bitrix: ответственные по сделке и компании, текущий пользователь. */
const withBitrix = (state: RootState, patch: { deal?: IBXDeal; company?: IBXCompany }): RootState => ({
    ...state,
    app: appReducer(
        state.app,
        appActions.setAppData({
            domain: state.app.domain,
            dealId: state.app.dealId,
            user: { ID: '9' },
            deal: patch.deal ?? deal,
            company: patch.company ?? company,
        }),
    ),
});

/** Живое состояние: номер договора с пробелами, поля сделки, спецификация, реквизит. */
const liveState = (): RootState => {
    const base = rootStateWith(syncedGeneral([main, additional]));
    let document = contractDocumentReducer(base.contractDocument, contractDocumentActions.setContractNumber(' 12/3 '));
    document = contractDocumentReducer(
        document,
        contractDocumentActions.setDealFieldsDefaults({
            contract_start: '2026-11-01',
            contract_end: '2027-11-01',
            garant_client_email: 'client@example.com',
        }),
    );
    document = contractDocumentReducer(
        document,
        contractDocumentActions.formLoaded({ contractForm: [], specification: [specificationItem] }),
    );
    return withBitrix(
        {
            ...base,
            contractDocument: document,
            bxrq: { ...base.bxrq, current: { ...base.bxrq.current, item: requisite } },
        },
        {},
    );
};

/**
 * Запрос без отметок времени: документные формы договора и поставки ставят
 * created_at / updated_at в момент сборки, два вызова подряд различаются на миллисекунды.
 */
const withoutTimestamps = (request: unknown): unknown =>
    JSON.parse(
        JSON.stringify(request, (key, value: unknown) =>
            key === 'created_at' || key === 'updated_at' ? undefined : value,
        ),
    );

describe('ядро сборки договора и обёртки живого состояния', () => {
    const state = liveState();
    const coreInput = {
        catalog,
        general: state.rowSet.general,
        clientType: toOfferClientType(null),
        serviceDepartment: false,
    };

    it('форма спецификации: обёртка равна ядру на тех же данных', () => {
        const request = buildSpecificationFormRequest(state);
        expect(request).not.toBeNull();
        expect(withoutTimestamps(request)).toEqual(withoutTimestamps(buildSpecificationFormCore(coreInput)));
    });

    it('generate: обёртка равна ядру на тех же данных', () => {
        const request = buildContractGenerateRequest(state);
        expect(request).not.toBeNull();
        const viaCore = buildContractGenerateCore({
            ...coreInput,
            shared: {
                domain: 'gsr.bitrix24.ru',
                dealId: 129487,
                companyId: '77',
                providerId: 1,
                userId: 5,
                clientType: toOfferClientType(null),
                dealFields: state.contractDocument.dealFields,
                rq: requisite,
            },
            values: { contractNumber: ' 12/3 ', specification: [specificationItem] },
        });
        expect(withoutTimestamps(request)).toEqual(withoutTimestamps(viaCore));
    });

    it('generate: номер без пробелов, поля сделки, спецификация и реквизит из состояния', () => {
        const request = buildContractGenerateRequest(state);
        expect(request).toMatchObject({
            domain: 'gsr.bitrix24.ru',
            dealId: '129487',
            companyId: '77',
            providerId: 1,
            contractNumber: '12/3',
            contractStart: '2026-11-01',
            contractEnd: '2027-11-01',
            garantClientEmail: 'client@example.com',
            contractCreateDate: '',
            contractSpecificationState: { items: [specificationItem] },
            bxrq: { preset_id: 1 },
        });
    });

    it('подписывает ответственный по сделке, затем по компании, затем текущий пользователь', () => {
        const withoutDealOwner = withBitrix(state, { deal: { ...deal, ASSIGNED_BY_ID: '' } });
        expect(buildContractGenerateRequest(withoutDealOwner)?.userId).toBe(6);
        const withoutOwners = withBitrix(state, {
            deal: { ...deal, ASSIGNED_BY_ID: '' },
            company: { ...company, ASSIGNED_BY_ID: '' },
        });
        expect(buildContractGenerateRequest(withoutOwners)?.userId).toBe(9);
    });

    it('без реквизита уходит пустая форма: бэк ставит прочерки', () => {
        const withoutRq: RootState = { ...state, bxrq: { ...state.bxrq, current: { ...state.bxrq.current, item: null } } };
        expect(buildContractGenerateRequest(withoutRq)?.bxrq).toEqual({
            preset_id: 0,
            fields: [],
            address: { items: [] },
            bank: { current: { id: 0, fields: [] }, items: [] },
        });
    });

    it('блокер (нет поставщика) оставляет generate пустым, форма от поставщика не зависит', () => {
        const withoutProvider: RootState = {
            ...state,
            documentProvider: { ...state.documentProvider, current: null },
        };
        expect(buildContractGenerateRequest(withoutProvider)).toBeNull();
        expect(buildSpecificationFormRequest(withoutProvider)).not.toBeNull();
    });

    it('ядро собирает договор любого набора: наполнение берётся из переданного набора', () => {
        const onlyMain = syncedGeneral([main]);
        const request = buildSpecificationFormCore({ ...coreInput, general: onlyMain });
        expect(request?.lt.paidPackets).toEqual([]);
        expect(buildSpecificationFormCore(coreInput)?.lt.paidPackets).toHaveLength(1);
    });

    it('набор без главной строки: запросов нет', () => {
        const empty = { ...state.rowSet.general, rows: [] };
        expect(buildSpecificationFormCore({ ...coreInput, general: empty })).toBeNull();
    });
});
