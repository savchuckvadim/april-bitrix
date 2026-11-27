import { INVOICE_TEMPLATE_VISIBILITY, type InvoiceTemplate } from '../model';

/** Общий шаблон правит только суперпользователь, остальные правят шаблоны портала. */
export const canManageInvoiceTemplate = (
    template: Pick<InvoiceTemplate, 'visibility'>,
    isSuperUser: boolean,
): boolean =>
    template.visibility !== INVOICE_TEMPLATE_VISIBILITY.PUBLIC || isSuperUser;

/** Объединение списков без повторов по id; при совпадении побеждает последний. */
export const mergeInvoiceTemplates = (
    ...lists: readonly (readonly InvoiceTemplate[])[]
): InvoiceTemplate[] => {
    const byId = new Map<string, InvoiceTemplate>();
    for (const list of lists) {
        for (const template of list) byId.set(template.id, template);
    }
    return [...byId.values()];
};

/** Порядок привязок в таблице: от самой точной к самой общей (как в подборе). */
const VISIBILITY_ORDER: Record<InvoiceTemplate['visibility'], number> = {
    provider: 0,
    portal: 1,
    public: 2,
};

/** Таблица: сначала живые, дальше привязка от точной к общей, затем название. */
export const sortInvoiceTemplates = (
    templates: readonly InvoiceTemplate[],
): InvoiceTemplate[] =>
    [...templates].sort(
        (a, b) =>
            Number(a.isArchived) - Number(b.isArchived) ||
            VISIBILITY_ORDER[a.visibility] - VISIBILITY_ORDER[b.visibility] ||
            a.name.localeCompare(b.name, 'ru'),
    );

/** Список для показа: архив виден только по переключателю. */
export const visibleInvoiceTemplates = (
    templates: readonly InvoiceTemplate[],
    showArchived: boolean,
): InvoiceTemplate[] =>
    sortInvoiceTemplates(
        showArchived
            ? templates
            : templates.filter(template => !template.isArchived),
    );

/** Сколько шаблонов в архиве: от него зависит подпись переключателя. */
export const archivedCount = (templates: readonly InvoiceTemplate[]): number =>
    templates.filter(template => template.isArchived).length;

/** Текст ошибки запроса: сообщение бэка, иначе сообщение ошибки, иначе запасной. */
export const requestErrorText = (error: unknown, fallback: string): string => {
    const fromBackend = (
        error as { response?: { data?: { message?: unknown } } } | null
    )?.response?.data?.message;
    if (typeof fromBackend === 'string' && fromBackend.trim()) {
        return fromBackend;
    }
    if (Array.isArray(fromBackend) && fromBackend.length) {
        return fromBackend.join(', ');
    }
    if (error instanceof Error && error.message.trim()) return error.message;
    return fallback;
};
