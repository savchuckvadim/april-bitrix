import type {
    InvoiceClientType,
    InvoiceSupplyType,
    InvoiceTemplate,
    InvoiceTemplateDto,
    ResolvedInvoiceTemplate,
    ResolvedInvoiceTemplateDto,
} from '../model';
import {
    INVOICE_CLIENT_TYPE_CODES,
    INVOICE_SUPPLY_TYPE_CODES,
} from './invoice-template-criteria.util';

/** Строка из поля, чей тип в сгенерированном клиенте потерян; пусто, значит `null`. */
const asNullableString = (value: unknown): string | null => {
    if (typeof value === 'string') return value === '' ? null : value;
    if (typeof value === 'number' || typeof value === 'bigint') {
        return String(value);
    }
    return null;
};

/**
 * Список кодов из ответа: известные коды без повторов; пусто, значит `null`
 * («подходит любому»). Незнакомый код отбрасывается: показать подпись мы
 * его не можем, а ограничение по нему бэк всё равно применяет.
 */
export const toCodeList = <T extends string>(
    raw: unknown,
    allowed: readonly T[],
): T[] | null => {
    if (!Array.isArray(raw)) return null;
    const codes = allowed.filter(code => raw.includes(code));
    return codes.length ? codes : null;
};

/** Ответ бэка в доменную модель шаблона. */
export const toInvoiceTemplate = (dto: InvoiceTemplateDto): InvoiceTemplate => ({
    id: dto.id,
    name: dto.name,
    description: asNullableString(dto.description),
    visibility: dto.visibility,
    portalId: asNullableString(dto.portal_id),
    agentId: asNullableString(dto.agent_id),
    clientTypes: toCodeList<InvoiceClientType>(
        dto.client_types,
        INVOICE_CLIENT_TYPE_CODES,
    ),
    supplyTypes: toCodeList<InvoiceSupplyType>(
        dto.supply_types,
        INVOICE_SUPPLY_TYPE_CODES,
    ),
    isDefault: Boolean(dto.is_default),
    isActive: dto.is_active !== false,
    isArchived: Boolean(dto.is_archived),
    updatedAt: asNullableString(dto.updated_at),
});

/** Ответ резолвера в доменную модель. */
export const toResolvedInvoiceTemplate = (
    dto: ResolvedInvoiceTemplateDto,
): ResolvedInvoiceTemplate => ({
    source: dto.source,
    templateId: asNullableString(dto.templateId),
    reason: dto.reason,
});
