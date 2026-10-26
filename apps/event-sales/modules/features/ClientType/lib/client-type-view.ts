import {
    findFieldItemByBitrixId,
    findPortalField,
    readFieldValue,
} from '@workspace/pbx';
// Глубокий импорт файла-констант: баррель pbx-data тянет class-энтити,
// не проходящие strict-tsc этого приложения.
import {
    PBX_SALES_EVENT_FIELD_CODES,
    type PbxSalesEventFieldItemCode,
} from '@workspace/pbx-data/entities/field/type/sales/event/pbx-sales-event-field.type';

/** Код варианта «Тип Клиента»: state, commerc, ip, fiz, layer. */
export type ClientTypeCode = PbxSalesEventFieldItemCode<'op_client_type'>;

export const CLIENT_TYPE_FIELD_CODE = PBX_SALES_EVENT_FIELD_CODES.op_client_type;

type PortalFields = Parameters<typeof findPortalField>[0];

export interface ClientTypeOption {
    code: ClientTypeCode;
    name: string;
}

export interface ClientTypeView {
    /** Поле есть у открытой сущности — значок показывается. */
    available: boolean;
    /** Что показать: тип компании, без него — сделки. */
    current: ClientTypeCode | null;
    deal: ClientTypeCode | null;
    company: ClientTypeCode | null;
    /** У сделки и компании разные типы — выбирает человек. */
    conflict: boolean;
    options: ClientTypeOption[];
}

export interface ClientTypeViewInput {
    dealFields: PortalFields;
    companyFields: PortalFields;
    deal: Record<string, unknown> | null;
    company: Record<string, unknown> | null;
    /** Значения, записанные в этой сессии, — важнее строк из app.bitrix. */
    saved: { deal: ClientTypeCode | null; company: ClientTypeCode | null } | null;
}

/**
 * Код варианта из строки сущности. Значение enumeration — id варианта, и у
 * сделки и компании эти id РАЗНЫЕ, поэтому сравниваем только коды.
 */
const codeOf = (
    fields: PortalFields,
    row: Record<string, unknown> | null,
): ClientTypeCode | null => {
    const field = findPortalField(fields, CLIENT_TYPE_FIELD_CODE);
    const raw = readFieldValue(fields, row, CLIENT_TYPE_FIELD_CODE);
    if (!field || raw === null || raw === undefined || raw === '') return null;
    const item = findFieldItemByBitrixId(field, String(raw));
    return item ? (item.code as ClientTypeCode) : null;
};

/**
 * Вид «Типа клиента» для шапки (владелец 26.10.2026): значение одно на
 * клиента, главное — у компании, сделка его повторяет; разные — конфликт.
 * Чистая функция над слепком портала и строками сущностей.
 */
export const buildClientTypeView = (
    input: ClientTypeViewInput,
): ClientTypeView => {
    const dealField = input.deal
        ? findPortalField(input.dealFields, CLIENT_TYPE_FIELD_CODE)
        : null;
    const companyField = input.company
        ? findPortalField(input.companyFields, CLIENT_TYPE_FIELD_CODE)
        : null;
    const deal = input.saved
        ? input.saved.deal
        : codeOf(input.dealFields, input.deal);
    const company = input.saved
        ? input.saved.company
        : codeOf(input.companyFields, input.company);
    const optionsField = companyField ?? dealField;
    return {
        available: Boolean(dealField || companyField),
        current: company ?? deal,
        deal,
        company,
        conflict: Boolean(deal && company && deal !== company),
        options: (optionsField?.items ?? []).map(item => ({
            code: item.code as ClientTypeCode,
            name: item.name,
        })),
    };
};

/** Подпись варианта по коду; нет — сам код. */
export const clientTypeName = (
    options: readonly ClientTypeOption[],
    code: ClientTypeCode | null,
): string => options.find(option => option.code === code)?.name ?? code ?? '';
