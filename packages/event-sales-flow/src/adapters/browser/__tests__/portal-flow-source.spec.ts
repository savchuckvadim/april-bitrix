/**
 * PortalFlowSource: девять lookup-методов против ожиданий, снятых с
 * бэкового PortalModel (back/libs/portal-lib/portal/src/services/
 * portal.model.ts) — включая крайние случаи: поле не найдено, категория
 * по коду, таймзона незнакомого домена, слепок без секций.
 */
import { PortalFlowSource } from '../portal-flow-source';
import type { BrowserPortalSnapshot } from '../portal-flow-source';
import { ETimeZone } from '../../../shared/utils/date-convert.util';
import type { IField, IPCategory } from '../../../ports/flow-portal.port';

/** Обычное поле: bitrixId — суффикс без префикса (как ставит pbx-install). */
const contractTypeField: IField = {
    code: 'contract_type',
    bitrixId: 'CONTRACT_TYPE',
    items: [
        { code: 'garant', bitrixId: 101, name: 'Гарант' },
        { code: 'consultant', bitrixId: 102, name: 'Консультант+' },
    ],
};

/** Konstructor-строка слепка: bitrixId хранит уже ПОЛНОЕ имя UF_CRM_*. */
const konstructorField: IField = {
    code: 'op_mhistory',
    bitrixId: 'UF_CRM_1684144993',
    items: [],
};

/** Числовой суффикс — третий встречающийся формат bitrixId. */
const numericSuffixField: IField = {
    code: 'lead_quest',
    bitrixId: '1687967605',
    items: [],
};

const baseCategory: IPCategory = {
    code: 'sales_base',
    bitrixId: '34',
    stages: [
        // isActive у браузерного pbx-слепка — boolean (на бэке number)
        { code: 'base_new', bitrixId: 'C34:NEW', isActive: true },
    ],
};

const presentationCategory: IPCategory = {
    code: 'sales_presentation',
    bitrixId: '56',
    stages: [],
};

const snapshot = {
    bitrixDeal: {
        bitrixfields: [contractTypeField, konstructorField],
        categories: [baseCategory, presentationCategory],
    },
    company: {
        bitrixfields: [{ code: 'op_inn', bitrixId: 'OP_INN', items: [] }],
    },
    lead: {
        bitrixfields: [numericSuffixField],
        categories: [],
    },
    // Секции contact в слепке нет — легальный частичный слепок.
    bitrixLists: [
        { group: 'sales', type: 'kpi', bitrixId: 77 },
        { group: 'sales', type: 'history', bitrixId: '78' },
        { group: 'sales', type: 'presentation', bitrixId: 79 },
    ],
    bitrixCallingTasksGroup: { bitrixId: 123 },
} satisfies BrowserPortalSnapshot;

const DOMAIN = 'test.bitrix24.ru';
const source = () => new PortalFlowSource(snapshot, DOMAIN);

describe('PortalFlowSource: getEntityFieldByCode', () => {
    it('находит UF-поле каждой секции по pbx-коду (та же ссылка, не копия)', () => {
        const portal = source();
        expect(portal.getEntityFieldByCode('deal', 'contract_type')).toBe(
            contractTypeField,
        );
        expect(portal.getEntityFieldByCode('company', 'op_inn')?.bitrixId).toBe(
            'OP_INN',
        );
        expect(portal.getEntityFieldByCode('lead', 'lead_quest')).toBe(
            numericSuffixField,
        );
    });

    it('неустановленное поле → undefined (бэк: find без throw)', () => {
        expect(
            source().getEntityFieldByCode('deal', 'no_such_code'),
        ).toBeUndefined();
    });

    it('отсутствующая секция (contact) → undefined, как `?.` бэка', () => {
        expect(
            source().getEntityFieldByCode('contact', 'any_code'),
        ).toBeUndefined();
    });
});

describe('PortalFlowSource: getFieldBitrixId', () => {
    it('суффикс получает префикс UF_CRM_', () => {
        expect(source().getFieldBitrixId(contractTypeField)).toBe(
            'UF_CRM_CONTRACT_TYPE',
        );
    });

    it('полное имя konstructor-строки НЕ удваивает префикс', () => {
        expect(source().getFieldBitrixId(konstructorField)).toBe(
            'UF_CRM_1684144993',
        );
    });

    it('числовой суффикс — тоже с префиксом', () => {
        expect(source().getFieldBitrixId(numericSuffixField)).toBe(
            'UF_CRM_1687967605',
        );
    });
});

describe('PortalFlowSource: воронки сделок', () => {
    it('getDealCategoryByCode находит категорию по pbx-коду', () => {
        expect(source().getDealCategoryByCode('sales_base')).toBe(baseCategory);
        expect(source().getDealCategoryByCode('sales_presentation')).toBe(
            presentationCategory,
        );
    });

    it('неизвестный код категории → undefined', () => {
        expect(source().getDealCategoryByCode('sales_xo')).toBeUndefined();
    });

    it('getDealCategories отдаёт все воронки рабочей записи deals[0]', () => {
        expect(source().getDealCategories()).toEqual([
            baseCategory,
            presentationCategory,
        ]);
    });

    it('слепок без bitrixDeal деградирует в [], а не в TypeError бэка', () => {
        const empty = new PortalFlowSource({}, DOMAIN);
        expect(empty.getDealCategories()).toEqual([]);
        expect(empty.getDealCategoryByCode('sales_base')).toBeUndefined();
        expect(
            empty.getEntityFieldByCode('deal', 'contract_type'),
        ).toBeUndefined();
    });
});

describe('PortalFlowSource: getListByCode', () => {
    it('находит список по ключу `${group}_${type}` в bitrixLists', () => {
        const portal = source();
        expect(portal.getListByCode('sales_kpi')?.bitrixId).toBe(77);
        expect(portal.getListByCode('sales_history')?.bitrixId).toBe('78');
        expect(portal.getListByCode('sales_presentation')?.bitrixId).toBe(79);
    });

    it('ненастроенный список → undefined', () => {
        expect(source().getListByCode('service_ork_history')).toBeUndefined();
    });
});

describe('PortalFlowSource: getTimezone (карта доменов бэка)', () => {
    it('gsirk → Иркутск, alfacentr → Новосибирск', () => {
        expect(
            new PortalFlowSource(snapshot, 'gsirk.bitrix24.ru').getTimezone(),
        ).toBe(ETimeZone.ASIA_IRKUTSK);
        expect(
            new PortalFlowSource(
                snapshot,
                'alfacentr.bitrix24.ru',
            ).getTimezone(),
        ).toBe(ETimeZone.ASIA_NOVOSIBIRSK);
    });

    it('незнакомый домен → дефолт Europe/Moscow', () => {
        expect(source().getTimezone()).toBe(ETimeZone.EUROPE_MOSCOW);
    });
});

describe('PortalFlowSource: getFieldItemByCode', () => {
    it('находит item справочного поля по коду', () => {
        expect(
            source().getFieldItemByCode(contractTypeField, 'consultant')
                ?.bitrixId,
        ).toBe(102);
    });

    it('неустановленный item → undefined', () => {
        expect(
            source().getFieldItemByCode(contractTypeField, 'nolim'),
        ).toBeUndefined();
    });
});

describe('PortalFlowSource: getSalesTaskGroupId', () => {
    it('берёт bitrixId установленной группы звонков', () => {
        expect(source().getSalesTaskGroupId()).toBe(123);
    });

    it('группа не установлена → бэковый фолбэк 41', () => {
        const withoutGroup = new PortalFlowSource(
            { ...snapshot, bitrixCallingTasksGroup: undefined },
            DOMAIN,
        );
        expect(withoutGroup.getSalesTaskGroupId()).toBe(41);
    });
});

describe('PortalFlowSource: getPortal (IPortal-вид слепка)', () => {
    it('домен инжектится, рабочая запись deals[0] — из bitrixDeal, ссылки живые', () => {
        const portal = source().getPortal();
        expect(portal.domain).toBe(DOMAIN);
        expect(portal.deals).toHaveLength(1);
        expect(portal.deals[0].bitrixfields).toBe(
            snapshot.bitrixDeal.bitrixfields,
        );
        expect(portal.deals[0].categories).toBe(snapshot.bitrixDeal.categories);
        expect(portal.bitrixLists).toBe(snapshot.bitrixLists);
        expect(portal.lists).toBeUndefined();
        expect(portal.company?.bitrixfields).toBe(
            snapshot.company.bitrixfields,
        );
        expect(portal.contact).toBeUndefined();
    });
});
