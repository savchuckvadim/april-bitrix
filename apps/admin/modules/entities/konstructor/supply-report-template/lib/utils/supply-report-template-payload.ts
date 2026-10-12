/**
 * Нормализация значений формы в тело запроса.
 *
 * Здесь живут ДВА разных доменных правила, которые легко перепутать:
 *
 *  1. CREATE: пустой список НЕ отправляется. Отсутствие поля — это
 *     «подходит любому» / «состав формы берётся из кода» (на бэке NULL).
 *     Отправить `[]` нельзя: `parseMultipartList` вернёт `undefined` на
 *     пустой строке, но для JSON-строки `"[]"` отдаст пустой массив, и
 *     шаблон запишется с пустым списком вместо NULL.
 *
 *  2. UPDATE: пустой список ОТПРАВЛЯЕТСЯ. Там отсутствие поля означает
 *     «не менять», поэтому единственный способ СБРОСИТЬ ограничение в
 *     «любой» — прислать пустой массив (бэкенд нормализует его в NULL).
 *
 * Пустая строка в `portal_id`/`agent_id` в update — это осмысленное
 * значение («перевести в общие» / «снять поставщика»), поэтому она
 * сохраняется, а не выбрасывается как пустое.
 */
import type {
    ClientTypeCode,
    SupplyReportFieldCode,
    SupplyTypeCode,
} from '@/modules/entities/konstructor/lib';
import { isKnownSupplyReportFieldCode } from '@/modules/entities/konstructor/lib';
import {
    SUPPLY_REPORT_TEMPLATE_SCOPE,
    type ICreateSupplyReportTemplateDto,
    type ISupplyReportTemplate,
    type ISupplyReportTemplateFormValues,
    type IUpdateSupplyReportTemplateDto,
    type SupplyReportTemplateScope,
} from '../../model';

/** Обрезка строки; пусто → `undefined`. */
const trimmedOrUndefined = (value: string | null | undefined): string | undefined => {
    const trimmed = (value ?? '').trim();
    return trimmed === '' ? undefined : trimmed;
};

/**
 * Список без повторов и пустых значений, с сохранением порядка выбора.
 * Пустой результат отдаётся как `undefined` — вызывающий решает, означает
 * это «не отправлять» (create) или «сбросить» (update).
 */
export function normalizeCodeList<T extends string>(
    values: readonly T[] | null | undefined,
): T[] | undefined {
    if (!values || values.length === 0) {
        return undefined;
    }
    const unique = Array.from(new Set(values.filter((value) => value !== '')));
    return unique.length === 0 ? undefined : (unique as T[]);
}

/**
 * Коды полей формы, которых нет в текущем определении формы на бэке.
 *
 * Бэкенд валидирует `required_fields`/`optional_fields` по белому списку,
 * выведенному из самой формы, и отвечает 400. Проверяем до отправки, чтобы
 * показать внятную ошибку в форме, а не «Bad Request».
 */
export function findUnknownSupplyReportFieldCodes(
    codes: readonly string[] | null | undefined,
): string[] {
    if (!codes || codes.length === 0) {
        return [];
    }
    return Array.from(
        new Set(codes.filter((code) => !isKnownSupplyReportFieldCode(code))),
    );
}

/**
 * Пара (`portal_id`, `agent_id`), выведенная из уровня привязки.
 *
 * `common` обнуляет оба: «Общий» — это именно `portal_id IS NULL`.
 * `portal` оставляет портал без поставщика. `provider` требует оба.
 */
export function resolveScopeIds(values: {
    scope: SupplyReportTemplateScope;
    portal_id: string;
    agent_id: string;
}): { portal_id?: string; agent_id?: string } {
    if (values.scope === SUPPLY_REPORT_TEMPLATE_SCOPE.common) {
        return {};
    }
    if (values.scope === SUPPLY_REPORT_TEMPLATE_SCOPE.portal) {
        return { portal_id: trimmedOrUndefined(values.portal_id) };
    }
    return {
        portal_id: trimmedOrUndefined(values.portal_id),
        agent_id: trimmedOrUndefined(values.agent_id),
    };
}

/** Уровень привязки существующей строки — для начальных значений формы. */
export function scopeOfTemplate(
    template: Pick<ISupplyReportTemplate, 'portal_id' | 'agent_id'>,
): SupplyReportTemplateScope {
    if (template.portal_id == null) {
        return SUPPLY_REPORT_TEMPLATE_SCOPE.common;
    }
    return template.agent_id == null
        ? SUPPLY_REPORT_TEMPLATE_SCOPE.portal
        : SUPPLY_REPORT_TEMPLATE_SCOPE.provider;
}

/**
 * Значения формы → тело создания.
 *
 * `file` обязателен на бэке, поэтому передаётся аргументом отдельно: форма
 * без выбранного файла до отправки не доходит.
 */
export function buildCreatePayload(
    values: ISupplyReportTemplateFormValues,
    file: File,
): ICreateSupplyReportTemplateDto {
    const scopeIds = resolveScopeIds(values);

    const dto: ICreateSupplyReportTemplateDto = {
        name: values.name.trim(),
        scope: values.scope,
        is_default: values.is_default,
        is_active: values.is_active,
        file,
    };

    if (scopeIds.portal_id !== undefined) {
        dto.portal_id = scopeIds.portal_id;
    }
    if (scopeIds.agent_id !== undefined) {
        dto.agent_id = scopeIds.agent_id;
    }

    const clientTypes = normalizeCodeList<ClientTypeCode>(values.client_types);
    if (clientTypes) {
        dto.client_types = clientTypes;
    }

    const supplyTypes = normalizeCodeList<SupplyTypeCode>(values.supply_types);
    if (supplyTypes) {
        dto.supply_types = supplyTypes;
    }

    const requiredFields = normalizeCodeList<SupplyReportFieldCode>(
        values.required_fields,
    );
    if (requiredFields) {
        dto.required_fields = requiredFields;
    }

    const optionalFields = normalizeCodeList<SupplyReportFieldCode>(
        values.optional_fields,
    );
    if (optionalFields) {
        dto.optional_fields = optionalFields;
    }

    const description = trimmedOrUndefined(values.description);
    if (description !== undefined) {
        dto.description = description;
    }

    if (values.demo) {
        dto.demo = values.demo;
    }

    return dto;
}

/**
 * Значения формы → тело обновления.
 *
 * Все списки отправляются ВСЕГДА (пустой массив = сброс в «любой»), иначе
 * снять ограничение через интерфейс было бы невозможно. `scope` в update
 * не участвует: портал и поставщик меняются своими полями.
 */
export function buildUpdatePayload(
    values: ISupplyReportTemplateFormValues,
): IUpdateSupplyReportTemplateDto {
    const scopeIds = resolveScopeIds(values);

    const dto: IUpdateSupplyReportTemplateDto = {
        name: values.name.trim(),
        // Пустая строка — осмысленное значение: «перевести в общие».
        portal_id: scopeIds.portal_id ?? '',
        // Пустая строка снимает привязку к поставщику.
        agent_id: scopeIds.agent_id ?? '',
        client_types: normalizeCodeList<ClientTypeCode>(values.client_types) ?? [],
        supply_types: normalizeCodeList<SupplyTypeCode>(values.supply_types) ?? [],
        required_fields:
            normalizeCodeList<SupplyReportFieldCode>(values.required_fields) ?? [],
        optional_fields:
            normalizeCodeList<SupplyReportFieldCode>(values.optional_fields) ?? [],
        description: trimmedOrUndefined(values.description) ?? '',
        is_default: values.is_default,
        is_active: values.is_active,
    };

    if (values.file) {
        dto.file = values.file;
    }
    if (values.demo) {
        dto.demo = values.demo;
    }

    return dto;
}

/** Начальные значения формы из существующей строки. */
export function formValuesOfTemplate(
    template: ISupplyReportTemplate,
): ISupplyReportTemplateFormValues {
    return {
        name: template.name,
        scope: scopeOfTemplate(template),
        portal_id: template.portal_id ?? '',
        agent_id: template.agent_id ?? '',
        client_types: template.client_types ?? [],
        supply_types: template.supply_types ?? [],
        required_fields: template.required_fields ?? [],
        optional_fields: template.optional_fields ?? [],
        description: template.description ?? '',
        is_default: template.is_default,
        is_active: template.is_active,
        file: null,
        demo: null,
    };
}

/** Пустые значения формы для создания. */
export function emptyFormValues(
    portalId?: string,
): ISupplyReportTemplateFormValues {
    return {
        name: '',
        scope: portalId
            ? SUPPLY_REPORT_TEMPLATE_SCOPE.portal
            : SUPPLY_REPORT_TEMPLATE_SCOPE.common,
        portal_id: portalId ?? '',
        agent_id: '',
        client_types: [],
        supply_types: [],
        required_fields: [],
        optional_fields: [],
        description: '',
        is_default: false,
        is_active: true,
        file: null,
        demo: null,
    };
}
