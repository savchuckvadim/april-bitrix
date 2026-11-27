import type {
    ClientTypeEnum,
    InvoiceTemplateResponseDto,
    ResolvedTemplateResponseDto,
    SupplyTypeEnum,
} from '@workspace/nest-konstructor-api';

/**
 * Шаблоны счетов (`/api/invoice-templates`) и подбор шаблона
 * (`/api/konstructor/templates/resolve/invoice`): доменные типы слайса.
 *
 * Сгенерированный ответ терял тип каждого nullable-поля (orval выдал
 * `{ [key: string]: unknown }` вместо `string | null`), поэтому в домен он
 * переводится явно, в `lib/invoice-template.mapper.ts`. UI и хуки знают
 * только типы этого файла: переименование на бэке правится здесь и в маппере.
 */

/** Тип клиента бэка: `org_state | org | ip | fiz | advokat`. */
export type InvoiceClientType = ClientTypeEnum;

/** Тип поставки бэка: `internet | proxima`. */
export type InvoiceSupplyType = SupplyTypeEnum;

/** Видимость шаблона; она же режим привязки (общий, портал, поставщик). */
export const INVOICE_TEMPLATE_VISIBILITY = {
    PUBLIC: 'public',
    PORTAL: 'portal',
    PROVIDER: 'provider',
} as const;

export type InvoiceTemplateVisibility =
    (typeof INVOICE_TEMPLATE_VISIBILITY)[keyof typeof INVOICE_TEMPLATE_VISIBILITY];

/** Режим привязки шаблона: совпадает с видимостью на бэке. */
export type InvoiceBindMode = InvoiceTemplateVisibility;

/** Ответ бэка до перевода в домен. */
export type InvoiceTemplateDto = InvoiceTemplateResponseDto;

/** Ответ резолвера «какой шаблон счёта уйдёт». */
export type ResolvedInvoiceTemplateDto = ResolvedTemplateResponseDto;

/**
 * Шаблон счёта. `clientTypes` и `supplyTypes` равны `null`, когда шаблон
 * подходит любому значению. ID строковые: на бэке это uuid и bigint.
 */
export interface InvoiceTemplate {
    id: string;
    name: string;
    description: string | null;
    visibility: InvoiceTemplateVisibility;
    portalId: string | null;
    /** Поставщик (agents.id); заполнен у режима «поставщик». */
    agentId: string | null;
    clientTypes: InvoiceClientType[] | null;
    supplyTypes: InvoiceSupplyType[] | null;
    isDefault: boolean;
    isActive: boolean;
    isArchived: boolean;
    updatedAt: string | null;
}

/** Куда привязан шаблон: портал и поставщик по режиму привязки. */
export interface InvoiceTemplateScope {
    visibility: InvoiceTemplateVisibility;
    portalId: string | null;
    agentId: string | null;
}

/** Данные создания шаблона: файл обязателен. */
export interface InvoiceTemplateCreateInput extends InvoiceTemplateScope {
    name: string;
    description: string;
    clientTypes: InvoiceClientType[];
    supplyTypes: InvoiceSupplyType[];
    isDefault: boolean;
    isActive: boolean;
    /** ID пользователя Битрикса, загрузившего шаблон. */
    creatorBitrixUserId: string | null;
    file: File;
}

/**
 * Данные правки шаблона: форма хранит полное состояние, поэтому пустой список
 * критериев означает «снять ограничение» и уходит на бэк как `"[]"`.
 */
export interface InvoiceTemplateUpdateInput extends InvoiceTemplateScope {
    name: string;
    description: string;
    clientTypes: InvoiceClientType[];
    supplyTypes: InvoiceSupplyType[];
    isDefault: boolean;
    isActive: boolean;
    /** Новый файл; без него остаётся прежний. */
    file: File | null;
}

/** Признаки, по которым бэк подбирает шаблон счёта. */
export interface InvoiceTemplateCriteria {
    /** Домен портала: из него бэк выводит портал. */
    domain: string;
    /** Поставщик (agents.id); не выбран, если `null`. */
    providerId: number | null;
    clientType: InvoiceClientType | null;
    supplyType: InvoiceSupplyType | null;
}

/**
 * Какой шаблон уйдёт. `templateId = null` при `source = 'db'` означает, что
 * подходящего шаблона нет и счёт на этих признаках не соберётся.
 */
export interface ResolvedInvoiceTemplate {
    source: ResolvedInvoiceTemplateDto['source'];
    templateId: string | null;
    /** Человекочитаемое «почему этот шаблон», от бэка. */
    reason: string;
}

/** Значения формы шаблона. */
export interface InvoiceTemplateFormValues {
    name: string;
    description: string;
    bindMode: InvoiceBindMode;
    /** Поставщик для режима «поставщик». */
    agentId: string | null;
    clientTypes: InvoiceClientType[];
    supplyTypes: InvoiceSupplyType[];
    isDefault: boolean;
    isActive: boolean;
    file: File | null;
}

/** Ошибки полей формы: текст под полем. */
export type InvoiceTemplateFormErrors = Partial<
    Record<'name' | 'file' | 'bindMode' | 'agentId', string>
>;
