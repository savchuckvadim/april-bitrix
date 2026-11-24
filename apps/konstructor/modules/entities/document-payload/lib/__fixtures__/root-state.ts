import type { RootState } from '@/modules/app/model/store';
import { setupStore } from '@/modules/app/model/store';
import { catalogActions, catalogReducer } from '../../../catalog';
import type { Portal } from '../../../portal';
import type { Provider } from '../../../provider';
import type { RowSet } from '../../../row-set';
import { REGION_CODE, catalog } from './two-garant-set';

/**
 * Состояние приложения для тестов сборщиков документов (договор, отчёт о
 * поставке): начальное состояние настоящего стора, поверх — каталог, общий
 * набор, домен/сделка и поставщик. Файл тянет весь стор, поэтому подключается
 * только тестами, которым нужен RootState.
 */
export const provider: Provider = {
    id: '1',
    name: 'Гарант-Сервис',
    rqId: '1',
    domain: 'gsr.bitrix24.ru',
    withTax: false,
    rq: {
        id: 1,
        name: null,
        number: null,
        type: 'organization',
        fullname: 'Гарант-Сервис',
        shortname: null,
        director: null,
        position: null,
        accountant: null,
        based: null,
        inn: null,
        kpp: null,
        ogrn: null,
        ogrnip: null,
        personName: null,
        document: null,
        docSer: null,
        docNum: null,
        docDate: null,
        docIssuedBy: null,
        docDepCode: null,
        registredAdress: null,
        primaryAdresss: null,
        email: null,
        garantEmail: null,
        phone: null,
        assigned: null,
        assignedPhone: null,
        other: null,
        bank: null,
        bik: null,
        rs: null,
        ks: null,
        bankAdress: null,
        bankOther: null,
        qrs: [],
        withTax: false,
    },
};

/** Коды пунктов «Тип клиента» (pbx op_client_type) и их bitrixId на тестовом портале. */
export type ClientTypeItemCode = 'commerc' | 'state' | 'ip' | 'fiz' | 'layer';

const CLIENT_TYPE_ITEMS: Array<{ code: ClientTypeItemCode; bitrixId: number }> = [
    { code: 'commerc', bitrixId: 31 },
    { code: 'state', bitrixId: 32 },
    { code: 'ip', bitrixId: 33 },
    { code: 'fiz', bitrixId: 34 },
    { code: 'layer', bitrixId: 35 },
];

/**
 * Состояние с типом клиента компании: поле `op_client_type` в слепке портала и
 * значение в компании Битрикса. Код `null` — поле на портале есть, значение у
 * компании и сделки не задано (selectClientType даёт null).
 */
export const withClientType = (state: RootState, itemCode: ClientTypeItemCode | null): RootState => {
    const item = CLIENT_TYPE_ITEMS.find(candidate => candidate.code === itemCode);
    const portal = {
        company: { bitrixfields: [{ code: 'op_client_type', bitrixId: 'OP_CLIENT_TYPE', items: CLIENT_TYPE_ITEMS }] },
        bitrixDeal: { bitrixfields: [] },
    } as unknown as Portal;
    const company = (item ? { ID: '1', UF_CRM_OP_CLIENT_TYPE: String(item.bitrixId) } : { ID: '1' }) as unknown as NonNullable<
        RootState['app']['bitrix']['company']
    >;
    return {
        ...state,
        portal: { ...state.portal, current: portal },
        app: { ...state.app, bitrix: { ...state.app.bitrix, company } },
    };
};

/**
 * Состояние для сборщиков документов: тип клиента — коммерческие (организация),
 * как у обычной сделки; другой тип или его отсутствие задаёт withClientType.
 */
export const rootStateWith = (general: RowSet): RootState => {
    const base = setupStore().getState();
    return withClientType(
        {
            ...base,
            app: { ...base.app, domain: 'gsr.bitrix24.ru', dealId: 129487 },
            catalog: catalogReducer(base.catalog, catalogActions.setCatalog(catalog)),
            rowSet: { ...base.rowSet, general, context: { ...base.rowSet.context, regionCode: REGION_CODE } },
            documentProvider: { ...base.documentProvider, current: provider },
        },
        'commerc',
    );
};
