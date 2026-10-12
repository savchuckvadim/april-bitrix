import { describe, expect, it } from 'vitest';
import {
    SUPPLY_REPORT_FIELDS,
    SUPPLY_REPORT_FIELDS_HELPER_TEXT,
    SUPPLY_REPORT_FIELD_CODES,
    SUPPLY_REPORT_FIELD_LABELS,
    SUPPLY_REPORT_FIELD_OPTIONS,
    formatSupplyReportFieldList,
    getSupplyReportFieldLabel,
    isKnownSupplyReportFieldCode,
} from './supply-report-fields.consts';

/**
 * Источник правды по кодам — бэкенд:
 * `back/apps/konstructor/src/document-supply-report/lib/supply-report-form.ts`
 * (`getSupplyReportFormFields()`), откуда белый список выводится
 * `modules/supply-report-template/lib/supply-report-field-codes.ts`.
 *
 * Эти тесты фиксируют состав и порядок: разошедшийся код шаблон отправит,
 * а бэкенд отвергнет 400 — тихо неработающая настройка.
 */
describe('SUPPLY_REPORT_FIELDS: состав полей формы', () => {
    it('ровно 15 активных полей группы supply, как на бэке', () => {
        expect(SUPPLY_REPORT_FIELDS).toHaveLength(15);
        expect(SUPPLY_REPORT_FIELD_CODES).toHaveLength(15);
    });

    it('коды и порядок дословно повторяют массив формы на бэке', () => {
        expect([...SUPPLY_REPORT_FIELD_CODES]).toEqual([
            'sale_date',
            'in_ork',
            'client_call_date',
            'in_arm',
            'invoice_pay_type',
            'finance',
            'is_contract_done',
            'contract_number',
            'contract_result',
            'current_contract',
            'is_invoice_done',
            'invoice_number',
            'invoice_result',
            'current_invoice',
            'situation_comments',
        ]);
    });

    it('коды уникальны', () => {
        expect(new Set(SUPPLY_REPORT_FIELD_CODES).size).toBe(
            SUPPLY_REPORT_FIELD_CODES.length,
        );
    });

    it('у каждого кода есть непустая русская подпись', () => {
        for (const code of SUPPLY_REPORT_FIELD_CODES) {
            expect(SUPPLY_REPORT_FIELD_LABELS[code]).toBeTruthy();
        }
    });

    it('в карте подписей нет ключей сверх списка кодов', () => {
        expect(Object.keys(SUPPLY_REPORT_FIELD_LABELS).sort()).toEqual(
            [...SUPPLY_REPORT_FIELD_CODES].sort(),
        );
    });

    it('подписи уникальны: дублирующееся «Дата и номер» уточнено в скобках', () => {
        // На бэке contract_number и invoice_number называются одинаково —
        // в выпадающем списке это было бы неразличимо.
        expect(SUPPLY_REPORT_FIELD_LABELS.contract_number).toBe(
            'Дата и номер (договор)',
        );
        expect(SUPPLY_REPORT_FIELD_LABELS.invoice_number).toBe(
            'Дата и номер (счёт)',
        );

        const labels = SUPPLY_REPORT_FIELDS.map((field) => field.label);
        expect(new Set(labels).size).toBe(labels.length);
    });
});

describe('getSupplyReportFieldLabel: подпись кода', () => {
    it.each([
        ['sale_date', 'Дата продажи'],
        ['in_ork', 'Передана в ОРК'],
        ['client_call_date', 'Клиент ждет звонка от менеджера ОРК'],
        ['in_arm', 'Занесена в АРМ'],
        ['invoice_pay_type', 'Особенности оплаты клиентом счетов'],
        ['finance', 'Как у них с финансами'],
        ['is_contract_done', 'Создавался ли Договор'],
        ['contract_result', 'Судьба договора'],
        ['current_contract', 'Текущий договор'],
        ['is_invoice_done', 'Создавался ли Счет'],
        ['invoice_result', 'Его судьба'],
        ['current_invoice', 'Текущий счет'],
        [
            'situation_comments',
            'Описание ситуации, примечания, дополнительные сведения',
        ],
    ])('«%s» → «%s»', (code, label) => {
        expect(getSupplyReportFieldLabel(code)).toBe(label);
    });

    it('неизвестный код показывается как есть, а не пустой строкой', () => {
        expect(getSupplyReportFieldLabel('made_up_code')).toBe('made_up_code');
    });

    it('имена из прототипа объекта не считаются кодами', () => {
        // Подпись возвращается как есть — но кодом такое имя не признаётся.
        expect(isKnownSupplyReportFieldCode('toString')).toBe(false);
        expect(isKnownSupplyReportFieldCode('constructor')).toBe(false);
    });
});

describe('isKnownSupplyReportFieldCode', () => {
    it('все 15 кодов формы признаются известными', () => {
        for (const code of SUPPLY_REPORT_FIELD_CODES) {
            expect(isKnownSupplyReportFieldCode(code)).toBe(true);
        }
    });

    it('«type» (тип клиента) НЕ код поля отчёта', () => {
        // На бэке это отдельный статический селект с group: 'rq';
        // привязка шаблона к типу клиента живёт в колонке client_types.
        expect(isKnownSupplyReportFieldCode('type')).toBe(false);
    });
});

describe('SUPPLY_REPORT_FIELD_OPTIONS: опции multiselect`а', () => {
    it('по одной опции на каждый код, порядок формы сохранён', () => {
        expect(SUPPLY_REPORT_FIELD_OPTIONS).toHaveLength(
            SUPPLY_REPORT_FIELD_CODES.length,
        );
        expect(SUPPLY_REPORT_FIELD_OPTIONS.map((option) => option.value)).toEqual([
            ...SUPPLY_REPORT_FIELD_CODES,
        ]);
    });

    it('каждая опция несёт значение и русскую подпись', () => {
        expect(SUPPLY_REPORT_FIELD_OPTIONS[0]).toEqual({
            value: 'sale_date',
            label: 'Дата продажи',
        });
    });
});

describe('formatSupplyReportFieldList: строка для таблицы и карточки', () => {
    it('пусто, null и undefined читаются как «состав формы из кода»', () => {
        expect(formatSupplyReportFieldList([])).toBe('Из кода');
        expect(formatSupplyReportFieldList(null)).toBe('Из кода');
        expect(formatSupplyReportFieldList(undefined)).toBe('Из кода');
    });

    it('коды заменяются подписями в порядке входа', () => {
        expect(
            formatSupplyReportFieldList(['situation_comments', 'sale_date']),
        ).toBe('Описание ситуации, примечания, дополнительные сведения, Дата продажи');
    });

    it('неизвестный код не теряется — показывается как есть', () => {
        expect(formatSupplyReportFieldList(['sale_date', 'dropped_code'])).toBe(
            'Дата продажи, dropped_code',
        );
    });
});

describe('хелпер-текст', () => {
    it('прямо говорит, что пустой выбор означает состав из кода', () => {
        expect(SUPPLY_REPORT_FIELDS_HELPER_TEXT).toContain('Пусто');
        expect(SUPPLY_REPORT_FIELDS_HELPER_TEXT).toContain('из кода');
    });
});
