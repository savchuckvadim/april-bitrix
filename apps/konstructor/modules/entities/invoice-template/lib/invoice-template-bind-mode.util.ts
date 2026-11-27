import {
    INVOICE_TEMPLATE_VISIBILITY,
    type InvoiceBindMode,
    type InvoiceTemplate,
    type InvoiceTemplateScope,
} from '../model';
import type { InvoiceTemplateQuota } from './invoice-template-quota.util';

/** Режимы привязки в порядке показа. */
export const INVOICE_BIND_MODES: readonly InvoiceBindMode[] = [
    INVOICE_TEMPLATE_VISIBILITY.PORTAL,
    INVOICE_TEMPLATE_VISIBILITY.PROVIDER,
    INVOICE_TEMPLATE_VISIBILITY.PUBLIC,
];

/** Подписи режимов привязки. */
export const INVOICE_BIND_MODE_LABELS: Record<InvoiceBindMode, string> = {
    public: 'Общий (все порталы)',
    portal: 'Портал (без привязки к поставщику)',
    provider: 'Поставщик портала',
};

/** Короткие подписи привязки для таблицы. */
export const INVOICE_BIND_MODE_SHORT_LABELS: Record<InvoiceBindMode, string> = {
    public: 'Общий',
    portal: 'Портал',
    provider: 'Поставщик',
};

/** Режим привязки шаблона: на бэке он совпадает с видимостью. */
export const bindModeOfTemplate = (
    template: Pick<InvoiceTemplate, 'visibility'>,
): InvoiceBindMode => template.visibility;

/** От чего зависит, к чему можно привязать шаблон. */
export interface BindModeAccess {
    /** Общие (публичные) шаблоны заводит только суперпользователь April. */
    isSuperUser: boolean;
    portalId: string | number | null | undefined;
    providerCount: number;
    quota: InvoiceTemplateQuota;
    /** Правимый шаблон; `null` при создании. */
    editing: InvoiceTemplate | null;
}

const hasPortal = (portalId: BindModeAccess['portalId']): boolean =>
    portalId != null && portalId !== '';

/**
 * Режимы привязки, доступные в форме.
 *
 * Общий: суперпользователю. Портал и поставщик: нужен портал и место в
 * квоте. Шаблон, который уже привязан к порталу, место в квоте не занимает:
 * переключение «портал» и «поставщик» число шаблонов портала не меняет.
 * Поставщик: плюс хотя бы один поставщик у портала.
 */
export const availableBindModes = (
    access: BindModeAccess,
): InvoiceBindMode[] => {
    const { editing, quota } = access;
    const alreadyScoped =
        editing != null &&
        editing.visibility !== INVOICE_TEMPLATE_VISIBILITY.PUBLIC;
    const roomForPortal =
        hasPortal(access.portalId) && (alreadyScoped || quota.canCreate);

    return INVOICE_BIND_MODES.filter(mode => {
        if (mode === INVOICE_TEMPLATE_VISIBILITY.PUBLIC) {
            return access.isSuperUser;
        }
        if (mode === INVOICE_TEMPLATE_VISIBILITY.PROVIDER) {
            return roomForPortal && access.providerCount > 0;
        }
        return roomForPortal;
    });
};

/** Режим по умолчанию для новой формы: первый из доступных; нет доступных, значит `null`. */
export const defaultBindMode = (
    access: BindModeAccess,
): InvoiceBindMode | null => availableBindModes(access)[0] ?? null;

/**
 * Можно ли открыть форму создания: суперпользователь (общий шаблон) или
 * портал с местом в квоте.
 */
export const canStartCreate = (access: BindModeAccess): boolean =>
    defaultBindMode({ ...access, editing: null }) !== null;

/** Ошибки привязки: режим недоступен либо не выбран поставщик. */
export interface BindModeErrors {
    bindMode?: string;
    agentId?: string;
}

export const BIND_MODE_UNAVAILABLE = 'Эта привязка сейчас недоступна';
export const BIND_AGENT_REQUIRED = 'Выберите поставщика';

/** Проверка привязки до запроса: бэк отвечает на такие случаи только 400. */
export const validateBindMode = (
    mode: InvoiceBindMode,
    agentId: string | null,
    available: readonly InvoiceBindMode[],
): BindModeErrors => {
    const errors: BindModeErrors = {};
    if (!available.includes(mode)) errors.bindMode = BIND_MODE_UNAVAILABLE;
    if (mode === INVOICE_TEMPLATE_VISIBILITY.PROVIDER && !agentId) {
        errors.agentId = BIND_AGENT_REQUIRED;
    }
    return errors;
};

/**
 * Режим привязки в поля бэка: общий без портала и поставщика, портал с
 * порталом, поставщик с обоими (зеркало `parseInvoiceTemplateVisibilityScope`).
 */
export const bindModeToScope = (
    mode: InvoiceBindMode,
    portalId: string | number | null | undefined,
    agentId: string | null,
): InvoiceTemplateScope => {
    if (mode === INVOICE_TEMPLATE_VISIBILITY.PUBLIC) {
        return { visibility: mode, portalId: null, agentId: null };
    }
    const portal = hasPortal(portalId) ? String(portalId) : null;
    if (mode === INVOICE_TEMPLATE_VISIBILITY.PORTAL) {
        return { visibility: mode, portalId: portal, agentId: null };
    }
    return { visibility: mode, portalId: portal, agentId };
};

/** Название поставщика по его id; нет такого, значит «Поставщик №id». */
export const providerNameOf = (
    providers: readonly { id: string; name: string }[],
    agentId: string | null,
): string | null => {
    if (!agentId) return null;
    const found = providers.find(provider => provider.id === agentId);
    return found?.name?.trim() || `Поставщик №${agentId}`;
};

/** Привязка шаблона для таблицы: «Общий», «Портал» или имя поставщика. */
export const bindingLabelOf = (
    template: Pick<InvoiceTemplate, 'visibility' | 'agentId'>,
    providers: readonly { id: string; name: string }[],
): string =>
    template.visibility === INVOICE_TEMPLATE_VISIBILITY.PROVIDER
        ? (providerNameOf(providers, template.agentId) ??
          INVOICE_BIND_MODE_SHORT_LABELS.provider)
        : INVOICE_BIND_MODE_SHORT_LABELS[template.visibility];
