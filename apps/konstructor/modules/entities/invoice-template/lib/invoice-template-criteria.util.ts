// файл констант, не баррель: баррель bx-rq тянет UI (а с ним react-pdf в тестах)
import { RQ_TYPE } from '../../bx-rq/model/types';
import type {
    InvoiceClientType,
    InvoiceSupplyType,
    InvoiceTemplateCriteria,
} from '../model';

/** Типы клиента в порядке показа. */
export const INVOICE_CLIENT_TYPE_CODES = [
    'org_state',
    'org',
    'ip',
    'fiz',
    'advokat',
] as const satisfies readonly InvoiceClientType[];

/** Типы поставки в порядке показа. */
export const INVOICE_SUPPLY_TYPE_CODES = [
    'internet',
    'proxima',
] as const satisfies readonly InvoiceSupplyType[];

/**
 * Подписи типов клиента: те же, что в админке
 * (`apps/admin/.../template-criteria.consts.ts`). `Record` по коду бэка:
 * появится новый тип, и `tsc` потребует подпись.
 */
export const INVOICE_CLIENT_TYPE_LABELS: Record<InvoiceClientType, string> = {
    org_state: 'Бюджетная организация',
    org: 'Организация',
    ip: 'ИП',
    fiz: 'Физлицо',
    advokat: 'Адвокатское образование',
};

/** Подписи типов поставки. */
export const INVOICE_SUPPLY_TYPE_LABELS: Record<InvoiceSupplyType, string> = {
    internet: 'Интернет',
    proxima: 'Проксима',
};

/**
 * Пустой список критериев значит «подходит любому» (на бэке NULL).
 * `null`, `undefined` и `[]` рисуются одинаково.
 */
export const ANY_CRITERIA_LABEL = 'Любой';

/** Подпись типа клиента; неизвестный код показываем как есть. */
export const invoiceClientTypeLabel = (code: string): string =>
    INVOICE_CLIENT_TYPE_LABELS[code as InvoiceClientType] ?? code;

/** Подпись типа поставки; неизвестный код показываем как есть. */
export const invoiceSupplyTypeLabel = (code: string): string =>
    INVOICE_SUPPLY_TYPE_LABELS[code as InvoiceSupplyType] ?? code;

/** Строка для таблицы: подписи через запятую либо «Любой». */
export const formatCriteriaList = (
    codes: readonly string[] | null | undefined,
    labelOf: (code: string) => string,
): string => (codes?.length ? codes.map(labelOf).join(', ') : ANY_CRITERIA_LABEL);

/** Опции выбора типа клиента: код и подпись. */
export const INVOICE_CLIENT_TYPE_OPTIONS = INVOICE_CLIENT_TYPE_CODES.map(
    code => ({ value: code, label: INVOICE_CLIENT_TYPE_LABELS[code] }),
);

/** Опции выбора типа поставки: код и подпись. */
export const INVOICE_SUPPLY_TYPE_OPTIONS = INVOICE_SUPPLY_TYPE_CODES.map(
    code => ({ value: code, label: INVOICE_SUPPLY_TYPE_LABELS[code] }),
);

/**
 * Тип клиента шапки (RQ_TYPE конструктора, без адвокатов) в код бэка.
 * Не задан в шапке, значит `null`: подбор тогда берёт шаблоны «для любого».
 */
export const clientTypeOfRq = (
    type: RQ_TYPE | null | undefined,
): InvoiceClientType | null => {
    switch (type) {
        case RQ_TYPE.ORGANIZATION:
            return 'org';
        case RQ_TYPE.BUDGET:
            return 'org_state';
        case RQ_TYPE.IP:
            return 'ip';
        case RQ_TYPE.FIZ:
            return 'fiz';
        default:
            return null;
    }
};

/** Query резолвера: пустые признаки опускаются, поставщик 0 или меньше тоже. */
export interface InvoiceResolveParams {
    domain: string;
    providerId?: number;
    clientType?: InvoiceClientType;
    supplyType?: InvoiceSupplyType;
}

/**
 * Признаки в query `GET konstructor/templates/resolve/invoice`. Поставщик не
 * выбран: параметр не шлём, и бэк ищет только шаблоны без поставщика (чужого
 * он не возьмёт никогда).
 */
export const buildResolveInvoiceParams = (
    criteria: InvoiceTemplateCriteria,
): InvoiceResolveParams => {
    const params: InvoiceResolveParams = { domain: criteria.domain };
    if (criteria.providerId != null && criteria.providerId > 0) {
        params.providerId = criteria.providerId;
    }
    if (criteria.clientType) params.clientType = criteria.clientType;
    if (criteria.supplyType) params.supplyType = criteria.supplyType;
    return params;
};
