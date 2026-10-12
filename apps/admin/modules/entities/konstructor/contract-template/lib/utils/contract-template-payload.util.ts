/**
 * Нормализация значений формы в тела запросов бэкенда.
 *
 * Вся доменная логика шаблона договора живёт ЗДЕСЬ, а не в компоненте:
 * форма — это строки и чекбоксы, а бэкенд ждёт пару (portal_id, agent_id),
 * выведенную из `scope`, и отсутствие поля там, где «подходит любому».
 * Чистые функции без React — поэтому их покрывает `.test.ts`
 * (в vitest-конфиге `include: ['modules/**\/*.test.ts']`, environment node;
 * `.test.tsx` не собирается).
 *
 * Правила, которые нельзя потерять:
 *
 * 1. `contract_type` ОБЯЗАТЕЛЕН. Шаблона договора «по умолчанию» не
 *    существует: отрендерить лицензионную сделку в абонентский шаблон —
 *    юридически неверный документ. Поэтому пустое значение не отправляется
 *    вовсе, а `validateContractTemplateForm` блокирует submit.
 *
 * 2. ПУСТОЙ `client_types`/`supply_types` при создании = «подходит любому»
 *    (NULL в БД). Поле ОПУСКАЕТСЯ, а не отправляется как `[]`: бэкенд
 *    нормализует пустой массив в NULL, но multipart с пустым списком —
 *    это строка `''`, которую `@Transform(parseMultipartList)` вернёт как
 *    `undefined`, и `@IsArray()` упал бы на валидации при `[]`.
 *
 * 3. При ОБНОВЛЕНИИ пустой массив, наоборот, ОТПРАВЛЯЕТСЯ: только так
 *    выражается «сбросить обратно в любой». Отсутствие поля в PATCH
 *    означает «не менять» — опустив его, сброс сделать невозможно.
 *
 * 4. `scope` в БД не хранится, из него выводятся portal_id/agent_id:
 *      common   → portal_id нет, agent_id нет (portal_id IS NULL = «Общий»)
 *      portal   → portal_id есть, agent_id нет
 *      provider → portal_id есть, agent_id есть
 *
 * 5. ID — СТРОКИ сквозь весь стек: в БД это BIGINT, значения > 2^53 не
 *    влезают в number. Никакого `Number(id)`.
 */
import {
    type ClientTypeCode,
    type ContractLtypeCode,
    type SupplyTypeCode,
    type TemplateScopeCode,
} from '@/modules/entities/konstructor/lib';
import type {
    IContractTemplate,
    IContractTemplateFormValues,
    ICreateContractTemplateDto,
    IUpdateContractTemplateDto,
} from '../../model';

/** Пустая строка/пробелы → undefined. Используется для id и описания. */
const trimmedOrUndefined = (value: string | null | undefined): string | undefined => {
    const trimmed = (value ?? '').trim();
    return trimmed === '' ? undefined : trimmed;
};

/**
 * Список признаков для СОЗДАНИЯ: пустой — опускается («подходит любому»).
 * Дубликаты снимаются: multiselect-чекбоксы при перерисовке формы могут
 * прислать один код дважды, а бэкенд пишет список в LongText как есть.
 */
const listForCreate = <T extends string>(
    values: readonly T[] | null | undefined,
): T[] | undefined => {
    const unique = Array.from(new Set(values ?? []));
    return unique.length === 0 ? undefined : unique;
};

/** Список признаков для ОБНОВЛЕНИЯ: пустой отправляется — это сброс в «любой». */
const listForUpdate = <T extends string>(
    values: readonly T[] | null | undefined,
): T[] => Array.from(new Set(values ?? []));

/** Какие поля области заполнены при данном `scope`. */
export const scopeBindings = (
    scope: TemplateScopeCode,
): { withPortal: boolean; withAgent: boolean } => ({
    withPortal: scope !== 'common',
    withAgent: scope === 'provider',
});

/** Обратный вывод: по сохранённой строке понять, какой `scope` выбирать в форме. */
export const scopeOfTemplate = (
    template: Pick<IContractTemplate, 'portal_id' | 'agent_id'>,
): TemplateScopeCode => {
    if (template.portal_id == null) {
        return 'common';
    }
    return template.agent_id == null
        ? 'portal'
        : 'provider';
};

/** Ошибки формы по именам полей; пустой объект — можно отправлять. */
export type ContractTemplateFormErrors = Partial<
    Record<'name' | 'contract_type' | 'portal_id' | 'agent_id' | 'file', string>
>;

/**
 * Проверка перед отправкой. Отдельно от react-hook-form, потому что
 * `contract_type` и пара (portal_id, agent_id) связаны со `scope`:
 * одного `required` на поле недостаточно.
 */
export const validateContractTemplateForm = (
    values: IContractTemplateFormValues,
    options: { mode: 'create' | 'edit' } = { mode: 'create' },
): ContractTemplateFormErrors => {
    const errors: ContractTemplateFormErrors = {};
    const { withPortal, withAgent } = scopeBindings(values.scope);

    if (trimmedOrUndefined(values.name) === undefined) {
        errors.name = 'Введите название шаблона';
    }

    // Обязательность типа договора — доменное правило, а не удобство формы.
    if (!values.contract_type) {
        errors.contract_type =
            'Выберите тип договора: шаблона «по умолчанию» для договоров не существует';
    }

    if (withPortal && trimmedOrUndefined(values.portal_id) === undefined) {
        errors.portal_id = 'Укажите портал для портального шаблона';
    }

    if (withAgent && trimmedOrUndefined(values.agent_id) === undefined) {
        errors.agent_id = 'Укажите поставщика для шаблона под поставщика';
    }

    // Файл обязателен только при создании: в PATCH он необязателен и
    // отсутствие означает «оставить прежний».
    if (options.mode === 'create' && !values.file) {
        errors.file = 'Загрузите файл шаблона (.docx)';
    }

    return errors;
};

export const isContractTemplateFormValid = (
    values: IContractTemplateFormValues,
    options: { mode: 'create' | 'edit' } = { mode: 'create' },
): boolean => Object.keys(validateContractTemplateForm(values, options)).length === 0;

/**
 * Значения формы → тело POST (multipart).
 *
 * Возвращает `null`, если форма невалидна: вызывающий код не должен
 * собирать запрос без `contract_type` или без файла — бэкенд ответит 400,
 * а пользователь увидит общую ошибку вместо подсказки у поля.
 */
export const buildCreateContractTemplatePayload = (
    values: IContractTemplateFormValues,
): ICreateContractTemplateDto | null => {
    if (!isContractTemplateFormValid(values, { mode: 'create' })) {
        return null;
    }

    const { withPortal, withAgent } = scopeBindings(values.scope);
    const clientTypes = listForCreate<ClientTypeCode>(values.client_types);
    const supplyTypes = listForCreate<SupplyTypeCode>(values.supply_types);
    const description = trimmedOrUndefined(values.description);
    const portalId = withPortal ? trimmedOrUndefined(values.portal_id) : undefined;
    const agentId = withAgent ? trimmedOrUndefined(values.agent_id) : undefined;

    return {
        name: (values.name ?? '').trim(),
        contract_type: values.contract_type as ContractLtypeCode,
        scope: values.scope,
        ...(portalId !== undefined ? { portal_id: portalId } : {}),
        ...(agentId !== undefined ? { agent_id: agentId } : {}),
        ...(clientTypes !== undefined ? { client_types: clientTypes } : {}),
        ...(supplyTypes !== undefined ? { supply_types: supplyTypes } : {}),
        ...(description !== undefined ? { description } : {}),
        is_default: values.is_default,
        is_active: values.is_active,
        file: values.file as File,
        ...(values.demo ? { demo: values.demo } : {}),
    };
};

/**
 * Значения формы → тело PATCH.
 *
 * Отличия от create:
 *  - списки отправляются всегда, в том числе пустыми (это сброс в «любой»);
 *  - `portal_id`/`agent_id` при сужении области отправляются ПУСТОЙ СТРОКОЙ:
 *    так update-DTO выражает «перевести в общие» / «снять поставщика»
 *    (`null` в PATCH означал бы «не менять», и привязка бы осталась);
 *  - `description` отправляется пустой строкой, чтобы его можно было стереть.
 */
export const buildUpdateContractTemplatePayload = (
    values: IContractTemplateFormValues,
): IUpdateContractTemplateDto | null => {
    if (!isContractTemplateFormValid(values, { mode: 'edit' })) {
        return null;
    }

    const { withPortal, withAgent } = scopeBindings(values.scope);

    return {
        name: (values.name ?? '').trim(),
        contract_type: values.contract_type as ContractLtypeCode,
        portal_id: withPortal ? (trimmedOrUndefined(values.portal_id) ?? '') : '',
        agent_id: withAgent ? (trimmedOrUndefined(values.agent_id) ?? '') : '',
        client_types: listForUpdate<ClientTypeCode>(values.client_types),
        supply_types: listForUpdate<SupplyTypeCode>(values.supply_types),
        description: (values.description ?? '').trim(),
        is_default: values.is_default,
        is_active: values.is_active,
    };
};

/** Сохранённая строка → значения формы редактирования. */
export const contractTemplateToFormValues = (
    template: IContractTemplate,
): IContractTemplateFormValues => ({
    name: template.name,
    contract_type: template.contract_type,
    scope: scopeOfTemplate(template),
    portal_id: template.portal_id ?? '',
    agent_id: template.agent_id ?? '',
    client_types: template.client_types ?? [],
    supply_types: template.supply_types ?? [],
    description: template.description ?? '',
    is_default: template.is_default,
    is_active: template.is_active,
    file: null,
    demo: null,
});

/** Значения формы по умолчанию. Портальное дерево задаёт `portalId`. */
export const emptyContractTemplateFormValues = (
    portalId?: string,
): IContractTemplateFormValues => ({
    name: '',
    contract_type: '',
    scope: portalId ? 'portal' : 'common',
    portal_id: portalId ?? '',
    agent_id: '',
    client_types: [],
    supply_types: [],
    description: '',
    is_default: false,
    is_active: true,
    file: null,
    demo: null,
});
