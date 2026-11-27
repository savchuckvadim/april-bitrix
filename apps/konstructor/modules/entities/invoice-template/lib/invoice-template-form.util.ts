import type {
    InvoiceBindMode,
    InvoiceTemplate,
    InvoiceTemplateCreateInput,
    InvoiceTemplateFormErrors,
    InvoiceTemplateFormValues,
    InvoiceTemplateUpdateInput,
} from '../model';
import {
    bindModeOfTemplate,
    bindModeToScope,
    validateBindMode,
} from './invoice-template-bind-mode.util';

export const NAME_REQUIRED = 'Укажите название';
export const FILE_REQUIRED = 'Загрузите файл шаблона (.docx)';

/** Новая форма: активный шаблон без ограничений, режим привязки задан. */
export const emptyInvoiceTemplateForm = (
    bindMode: InvoiceBindMode,
    agentId: string | null = null,
): InvoiceTemplateFormValues => ({
    name: '',
    description: '',
    bindMode,
    agentId: bindMode === 'provider' ? agentId : null,
    clientTypes: [],
    supplyTypes: [],
    isDefault: false,
    isActive: true,
    file: null,
});

/** Значения формы для правки шаблона. */
export const formValuesOfTemplate = (
    template: InvoiceTemplate,
): InvoiceTemplateFormValues => ({
    name: template.name,
    description: template.description ?? '',
    bindMode: bindModeOfTemplate(template),
    agentId: template.agentId,
    clientTypes: template.clientTypes ?? [],
    supplyTypes: template.supplyTypes ?? [],
    isDefault: template.isDefault,
    isActive: template.isActive,
    file: null,
});

/** Что нужно знать для проверки формы. */
export interface InvoiceTemplateFormContext {
    isEditing: boolean;
    availableModes: readonly InvoiceBindMode[];
}

/** Ошибки полей формы; пустой объект значит «можно отправлять». */
export const validateInvoiceTemplateForm = (
    values: InvoiceTemplateFormValues,
    context: InvoiceTemplateFormContext,
): InvoiceTemplateFormErrors => {
    const errors: InvoiceTemplateFormErrors = validateBindMode(
        values.bindMode,
        values.agentId,
        context.availableModes,
    );
    if (!values.name.trim()) errors.name = NAME_REQUIRED;
    if (!context.isEditing && !values.file) errors.file = FILE_REQUIRED;
    return errors;
};

/**
 * Смена режима привязки в форме. Поставщик нужен только режиму «поставщик»:
 * прежний выбор сохраняется, если он есть среди поставщиков портала, иначе
 * подставляется первый (нет поставщиков, значит `null`). Остальным режимам
 * поставщик сбрасывается.
 */
export const applyBindMode = (
    values: InvoiceTemplateFormValues,
    mode: InvoiceBindMode,
    providerIds: readonly string[],
): InvoiceTemplateFormValues => {
    if (mode !== 'provider') return { ...values, bindMode: mode, agentId: null };
    const kept =
        values.agentId && providerIds.includes(values.agentId)
            ? values.agentId
            : null;
    return { ...values, bindMode: mode, agentId: kept ?? providerIds[0] ?? null };
};

/**
 * Список с переключённым кодом в каноническом порядке (`order`): набор
 * не зависит от очерёдности кликов.
 */
export const toggleCode = <T extends string>(
    order: readonly T[],
    selected: readonly T[],
    code: T,
): T[] => {
    const next = selected.includes(code)
        ? selected.filter(item => item !== code)
        : [...selected, code];
    return order.filter(item => next.includes(item));
};

/** Форма в данные создания; нет файла, значит `null` (форма это уже отсекла). */
export const toCreateInput = (
    values: InvoiceTemplateFormValues,
    portalId: string | number | null | undefined,
    creatorBitrixUserId: number,
): InvoiceTemplateCreateInput | null => {
    if (!values.file) return null;
    return {
        ...bindModeToScope(values.bindMode, portalId, values.agentId),
        name: values.name.trim(),
        description: values.description.trim(),
        clientTypes: values.clientTypes,
        supplyTypes: values.supplyTypes,
        isDefault: values.isDefault,
        isActive: values.isActive,
        creatorBitrixUserId:
            creatorBitrixUserId > 0 ? String(creatorBitrixUserId) : null,
        file: values.file,
    };
};

/** Форма в данные правки. */
export const toUpdateInput = (
    values: InvoiceTemplateFormValues,
    portalId: string | number | null | undefined,
): InvoiceTemplateUpdateInput => ({
    ...bindModeToScope(values.bindMode, portalId, values.agentId),
    name: values.name.trim(),
    description: values.description.trim(),
    clientTypes: values.clientTypes,
    supplyTypes: values.supplyTypes,
    isDefault: values.isDefault,
    isActive: values.isActive,
    file: values.file,
});
