import type { RootState } from '@/modules/app/model/store';
import { setupStore } from '@/modules/app/model/store';
import { catalogActions, catalogReducer } from '../../../catalog';
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

export const rootStateWith = (general: RowSet): RootState => {
    const base = setupStore().getState();
    return {
        ...base,
        app: { ...base.app, domain: 'gsr.bitrix24.ru', dealId: 129487 },
        catalog: catalogReducer(base.catalog, catalogActions.setCatalog(catalog)),
        rowSet: { ...base.rowSet, general, context: { ...base.rowSet.context, regionCode: REGION_CODE } },
        documentProvider: { ...base.documentProvider, current: provider },
    };
};
