import type { Catalog } from '../../catalog';
import type { RowSet } from '../../row-set';
import type {
    OfferClientType,
    OfferGenerateRequest,
    OfferInvoice,
    OfferManager,
    OfferRecipient,
} from '../model/dto';
import { buildDocBody } from './build-doc-body';

export interface OfferPayloadInput {
    domain: string;
    dealId: number;
    companyId: number;
    userId: number;
    providerId: number;
    templateId: string;
    invoiceTemplateId?: string;
    clientType: OfferClientType;
    catalog: Catalog;
    general: RowSet;
    alternative: RowSet[];
    recipient: OfferRecipient;
    manager: OfferManager;
    invoice: OfferInvoice;
    isWord?: boolean;
    withoutQueue?: boolean;
}

/** Нечего печатать — null (нет главной строки или её договора/поставки в каталоге). */
export const buildOfferPayload = (input: OfferPayloadInput): OfferGenerateRequest | null => {
    const body = buildDocBody(input);
    if (!body) return null;

    return {
        templateId: input.templateId,
        invoiceTemplateId: input.invoiceTemplateId ?? '',
        domain: input.domain,
        companyId: String(input.companyId),
        dealId: String(input.dealId),
        providerId: input.providerId,
        userId: input.userId,
        ...body,
        clientType: input.clientType,
        isWord: input.isWord ?? false,
        recipient: input.recipient,
        manager: input.manager,
        invoice: input.invoice,
        withoutQueue: input.withoutQueue ?? false,
    };
};
