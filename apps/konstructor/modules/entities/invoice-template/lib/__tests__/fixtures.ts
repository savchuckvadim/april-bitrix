import type { InvoiceTemplate } from '../../model';

/** Шаблон портала с разумными значениями; поля перекрываются патчем. */
export const makeTemplate = (
    patch: Partial<InvoiceTemplate> = {},
): InvoiceTemplate => ({
    id: 't-1',
    name: 'Счёт',
    description: null,
    visibility: 'portal',
    portalId: '7',
    agentId: null,
    clientTypes: null,
    supplyTypes: null,
    isDefault: false,
    isActive: true,
    isArchived: false,
    updatedAt: null,
    ...patch,
});
