/**
 * Нормализация полезной нагрузки шаблона счёта: значения формы → DTO бэкенда.
 *
 * Правила домена, которые здесь закреплены (и покрыты тестами рядом):
 *   1. Пустой список критериев НЕ отправляется. На бэке «подходит любому» —
 *      это NULL, а `[]` в multipart приехало бы пустой строкой и прошло бы
 *      валидацию как «ограничение из нуля значений». Поле опускается.
 *   2. Пустая строка в необязательном поле — это «не задано», а не значение:
 *      такие поля тоже опускаются, иначе `portal_id=''` уйдёт на бэк.
 *   3. ID остаются СТРОКАМИ. Никакого Number()/parseInt.
 *   4. visibility=portal требует portal_id; visibility=provider требует и
 *      portal_id, и agent_id — это зеркало `parseInvoiceTemplateVisibilityScope`
 *      на бэке. Проверяем ДО запроса, чтобы пользователь увидел ошибку поля,
 *      а не 400.
 */
import type {
    IInvoiceTemplateFindAllParams,
    IInvoiceTemplateFormValues,
    ICreateInvoiceTemplateDto,
    IUpdateInvoiceTemplateDto,
    InvoiceTemplateVisibility,
} from '../../model';

/** Имена полей формы, на которые можно навесить ошибку. */
export type InvoiceTemplateFieldName = 'portal_id' | 'agent_id' | 'file';

/** Одна ошибка валидации: поле + текст для пользователя. */
export interface InvoiceTemplateFieldError {
    field: InvoiceTemplateFieldName;
    message: string;
}

export const PORTAL_ID_REQUIRED_MESSAGE =
    'Укажите портал: для видимости «Портал» и «Поставщик» портал обязателен';
export const AGENT_ID_REQUIRED_MESSAGE =
    'Укажите поставщика: для видимости «Поставщик» поставщик обязателен';
export const FILE_REQUIRED_MESSAGE = 'Загрузите файл шаблона';

/** Строка без пробелов по краям; пустая строка превращается в undefined. */
const trimmedOrUndefined = (value: string | null | undefined): string | undefined => {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
};

/**
 * Список критериев → значение для DTO.
 *
 * Пустой список даёт `undefined`, чтобы вызывающий код ОПУСТИЛ поле:
 * «ничего не выбрано» = «подходит любому» = NULL на бэке.
 */
export const normalizeCriteriaList = <T extends string>(
    values: readonly T[] | null | undefined,
): T[] | undefined => {
    if (!values || values.length === 0) {
        return undefined;
    }
    // Повторы из multiselect`а не должны уезжать на бэк.
    const unique = Array.from(new Set(values));
    return unique.length > 0 ? unique : undefined;
};

/**
 * Проверка области видимости — зеркало бэкендовой
 * `parseInvoiceTemplateVisibilityScope`.
 *
 * Возвращает список ошибок полей (пустой — всё в порядке), а не бросает:
 * вызывающая форма расставляет их по полям через `setError`.
 */
export const validateInvoiceTemplateScope = (values: {
    visibility: InvoiceTemplateVisibility;
    portal_id?: string | null;
    agent_id?: string | null;
}): InvoiceTemplateFieldError[] => {
    const errors: InvoiceTemplateFieldError[] = [];
    const portalId = trimmedOrUndefined(values.portal_id);
    const agentId = trimmedOrUndefined(values.agent_id);

    if (values.visibility === 'portal' || values.visibility === 'provider') {
        if (!portalId) {
            errors.push({
                field: 'portal_id',
                message: PORTAL_ID_REQUIRED_MESSAGE,
            });
        }
    }

    if (values.visibility === 'provider' && !agentId) {
        errors.push({ field: 'agent_id', message: AGENT_ID_REQUIRED_MESSAGE });
    }

    return errors;
};

/**
 * Значения формы → DTO создания.
 *
 * Файл обязателен, поэтому его отсутствие — ошибка поля, а не молчаливый
 * запрос без файла.
 */
export const buildCreateInvoiceTemplatePayload = (
    values: IInvoiceTemplateFormValues,
):
    | { ok: true; dto: ICreateInvoiceTemplateDto }
    | { ok: false; errors: InvoiceTemplateFieldError[] } => {
    const errors = validateInvoiceTemplateScope(values);

    if (!values.file) {
        errors.push({ field: 'file', message: FILE_REQUIRED_MESSAGE });
    }

    if (errors.length > 0) {
        return { ok: false, errors };
    }

    const dto: ICreateInvoiceTemplateDto = {
        name: values.name.trim(),
        visibility: values.visibility,
        type: values.type,
        is_default: values.is_default,
        is_active: values.is_active,
        // `file` уже проверен выше, но TS об этом не знает.
        file: values.file as Blob,
    };

    const portalId = trimmedOrUndefined(values.portal_id);
    if (portalId) {
        dto.portal_id = portalId;
    }

    const agentId = trimmedOrUndefined(values.agent_id);
    if (agentId) {
        dto.agent_id = agentId;
    }

    const description = trimmedOrUndefined(values.description);
    if (description) {
        dto.description = description;
    }

    const clientTypes = normalizeCriteriaList(values.client_types);
    if (clientTypes) {
        dto.client_types = clientTypes;
    }

    const supplyTypes = normalizeCriteriaList(values.supply_types);
    if (supplyTypes) {
        dto.supply_types = supplyTypes;
    }

    return { ok: true, dto };
};

/**
 * Значения формы → DTO обновления.
 *
 * Отличие от создания: файл НЕ обязателен (не передан — файл не меняется).
 */
export const buildUpdateInvoiceTemplatePayload = (
    values: IInvoiceTemplateFormValues,
):
    | { ok: true; dto: IUpdateInvoiceTemplateDto }
    | { ok: false; errors: InvoiceTemplateFieldError[] } => {
    const errors = validateInvoiceTemplateScope(values);
    if (errors.length > 0) {
        return { ok: false, errors };
    }

    const dto: IUpdateInvoiceTemplateDto = {
        name: values.name.trim(),
        visibility: values.visibility,
        type: values.type,
        is_default: values.is_default,
        is_active: values.is_active,
    };

    const portalId = trimmedOrUndefined(values.portal_id);
    if (portalId) {
        dto.portal_id = portalId;
    }

    const agentId = trimmedOrUndefined(values.agent_id);
    if (agentId) {
        dto.agent_id = agentId;
    }

    const description = trimmedOrUndefined(values.description);
    if (description) {
        dto.description = description;
    }

    const clientTypes = normalizeCriteriaList(values.client_types);
    if (clientTypes) {
        dto.client_types = clientTypes;
    }

    const supplyTypes = normalizeCriteriaList(values.supply_types);
    if (supplyTypes) {
        dto.supply_types = supplyTypes;
    }

    if (values.file) {
        dto.file = values.file;
    }

    return { ok: true, dto };
};

/**
 * Состояние фильтров списка → query-параметры запроса.
 *
 * Фильтрация серверная: пустые значения ОПУСКАЮТСЯ, иначе `search=''`
 * и `visibility=''` уедут на бэк. `is_archived: false` — осмысленное
 * значение и опускаться не должно, но бэк и так скрывает архив по умолчанию,
 * поэтому передаём флаг только когда он `true`.
 */
export const buildInvoiceTemplateListParams = (filters: {
    visibility?: string;
    portal_id?: string;
    agent_id?: string;
    is_active?: boolean;
    is_archived?: boolean;
    search?: string;
}): IInvoiceTemplateFindAllParams => {
    const params: IInvoiceTemplateFindAllParams = {};

    const visibility = trimmedOrUndefined(filters.visibility);
    if (visibility) {
        params.visibility = visibility as IInvoiceTemplateFindAllParams['visibility'];
    }

    const portalId = trimmedOrUndefined(filters.portal_id);
    if (portalId) {
        params.portal_id = portalId;
    }

    const agentId = trimmedOrUndefined(filters.agent_id);
    if (agentId) {
        params.agent_id = agentId;
    }

    if (typeof filters.is_active === 'boolean') {
        params.is_active = filters.is_active;
    }

    if (filters.is_archived === true) {
        params.is_archived = true;
    }

    const search = trimmedOrUndefined(filters.search);
    if (search) {
        params.search = search;
    }

    return params;
};
