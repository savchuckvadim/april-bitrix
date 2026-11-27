import { INVOICE_TEMPLATE_VISIBILITY, type InvoiceTemplate } from '../model';

/** Сколько шаблонов портала занято, сколько можно и можно ли добавить ещё. */
export interface InvoiceTemplateQuota {
    count: number;
    max: number;
    canCreate: boolean;
}

/** Нет портала: квоты нет, добавить нельзя. */
export const NO_PORTAL_QUOTA: InvoiceTemplateQuota = {
    count: 0,
    max: 0,
    canCreate: false,
};

const isPortalId = (portalId: string | number | null | undefined) =>
    portalId != null && portalId !== '';

/** Шаблоны портала: режимы «портал» и «поставщик», без архива. */
export const countPortalScopedInvoiceTemplates = (
    templates: readonly InvoiceTemplate[],
    portalId: string | number,
): number => {
    const id = String(portalId);
    return templates.filter(
        template =>
            !template.isArchived &&
            template.portalId === id &&
            (template.visibility === INVOICE_TEMPLATE_VISIBILITY.PORTAL ||
                template.visibility === INVOICE_TEMPLATE_VISIBILITY.PROVIDER),
    ).length;
};

/** Не больше шаблонов портала, чем поставщиков плюс один общий без привязки. */
export const maxPortalInvoiceTemplates = (providerCount: number): number =>
    Math.max(0, providerCount) + 1;

/** Квота портала по загруженным шаблонам и числу его поставщиков. */
export const invoiceTemplateQuota = (
    templates: readonly InvoiceTemplate[],
    portalId: string | number | null | undefined,
    providerCount: number,
): InvoiceTemplateQuota => {
    if (!isPortalId(portalId)) return NO_PORTAL_QUOTA;
    const count = countPortalScopedInvoiceTemplates(
        templates,
        portalId as string | number,
    );
    const max = maxPortalInvoiceTemplates(providerCount);
    return { count, max, canCreate: count < max };
};

/** Подсказка к квоте: правило и текущее заполнение. */
export const invoiceTemplateQuotaHint = (quota: InvoiceTemplateQuota): string =>
    `Шаблонов портала: ${quota.count} из ${quota.max}. Не больше числа поставщиков плюс один общий.`;
