/**
 * Коды и подписи полей формы «Отчёт о поставке».
 *
 * ИСТОЧНИК ПРАВДЫ — бэкенд:
 * `back/apps/konstructor/src/document-supply-report/lib/supply-report-form.ts`
 * (`getSupplyReportFormFields()`, 15 полей группы `supply`).
 * Коды и подписи перенесены дословно; порядок — как в массиве бэка.
 *
 * Эти коды складываются в `required_fields` / `optional_fields` шаблона отчёта
 * о поставке, поэтому выдумывать их нельзя: расхождение ломает сборку формы
 * в конструкторе.
 *
 * Две подписи на бэке неуникальны («Дата и номер» у договора и у счёта),
 * поэтому в UI они уточнены в скобках — сами коды не меняются.
 */

/** Код поля формы отчёта о поставке. */
export type SupplyReportFieldCode =
    | 'sale_date'
    | 'in_ork'
    | 'client_call_date'
    | 'in_arm'
    | 'invoice_pay_type'
    | 'finance'
    | 'is_contract_done'
    | 'contract_number'
    | 'contract_result'
    | 'current_contract'
    | 'is_invoice_done'
    | 'invoice_number'
    | 'invoice_result'
    | 'current_invoice'
    | 'situation_comments';

/** Описание поля формы для UI админки. */
export interface SupplyReportFieldMeta {
    code: SupplyReportFieldCode;
    /** Подпись из `supply-report-form.ts` (при неуникальности — уточнена). */
    label: string;
    /** `isRequired` в определении формы на бэке. */
    isRequiredInForm: boolean;
}

/**
 * 15 полей формы в порядке объявления на бэке.
 *
 * `isRequiredInForm` — обязательность в САМОЙ форме отчёта; она не равна
 * попаданию кода в `required_fields` шаблона (это разные вещи: шаблон лишь
 * сужает состав формы).
 */
export const SUPPLY_REPORT_FIELDS: readonly SupplyReportFieldMeta[] = [
    { code: 'sale_date', label: 'Дата продажи', isRequiredInForm: true },
    { code: 'in_ork', label: 'Передана в ОРК', isRequiredInForm: true },
    {
        code: 'client_call_date',
        label: 'Клиент ждет звонка от менеджера ОРК',
        isRequiredInForm: true,
    },
    { code: 'in_arm', label: 'Занесена в АРМ', isRequiredInForm: true },
    {
        code: 'invoice_pay_type',
        label: 'Особенности оплаты клиентом счетов',
        isRequiredInForm: true,
    },
    { code: 'finance', label: 'Как у них с финансами', isRequiredInForm: true },
    { code: 'is_contract_done', label: 'Создавался ли Договор', isRequiredInForm: true },
    { code: 'contract_number', label: 'Дата и номер (договор)', isRequiredInForm: false },
    { code: 'contract_result', label: 'Судьба договора', isRequiredInForm: true },
    { code: 'current_contract', label: 'Текущий договор', isRequiredInForm: false },
    { code: 'is_invoice_done', label: 'Создавался ли Счет', isRequiredInForm: true },
    { code: 'invoice_number', label: 'Дата и номер (счёт)', isRequiredInForm: false },
    { code: 'invoice_result', label: 'Его судьба', isRequiredInForm: true },
    { code: 'current_invoice', label: 'Текущий счет', isRequiredInForm: false },
    {
        code: 'situation_comments',
        label: 'Описание ситуации, примечания, дополнительные сведения',
        isRequiredInForm: true,
    },
] as const;

/** Карта код → подпись. */
export const SUPPLY_REPORT_FIELD_LABELS: Record<SupplyReportFieldCode, string> =
    SUPPLY_REPORT_FIELDS.reduce(
        (acc, field) => {
            acc[field.code] = field.label;
            return acc;
        },
        {} as Record<SupplyReportFieldCode, string>,
    );

/** Все коды в порядке формы. */
export const SUPPLY_REPORT_FIELD_CODES: readonly SupplyReportFieldCode[] =
    SUPPLY_REPORT_FIELDS.map((field) => field.code);

/** Опции multiselect`а полей формы. */
export const SUPPLY_REPORT_FIELD_OPTIONS: { value: string; label: string }[] =
    SUPPLY_REPORT_FIELDS.map((field) => ({ value: field.code, label: field.label }));

/** Подпись поля; неизвестный (например, снятый с бэка) код показываем как есть. */
export const getSupplyReportFieldLabel = (code: string): string =>
    SUPPLY_REPORT_FIELD_LABELS[code as SupplyReportFieldCode] ?? code;

/** Код существует в текущем определении формы на бэке. */
export const isKnownSupplyReportFieldCode = (code: string): code is SupplyReportFieldCode =>
    Object.prototype.hasOwnProperty.call(SUPPLY_REPORT_FIELD_LABELS, code);

/**
 * Список подписей для таблицы/карточки. Пусто = состав формы берётся из кода.
 */
export function formatSupplyReportFieldList(
    codes: readonly string[] | null | undefined,
): string {
    if (!codes || codes.length === 0) {
        return 'Из кода';
    }
    return codes.map(getSupplyReportFieldLabel).join(', ');
}

/** Хелпер-текст для multiselect`ов состава формы. */
export const SUPPLY_REPORT_FIELDS_HELPER_TEXT =
    'Пусто — состав формы берётся из кода (определение формы на бэкенде).';
