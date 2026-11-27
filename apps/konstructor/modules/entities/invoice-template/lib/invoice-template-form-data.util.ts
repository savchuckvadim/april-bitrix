import type {
    InvoiceTemplateCreateInput,
    InvoiceTemplateUpdateInput,
} from '../model';

/**
 * Сборка multipart-тел шаблона счёта.
 *
 * Сгенерированные `invoiceTemplateCreate` и `invoiceTemplateUpdate` кладут
 * список критериев повторяющимися полями и на пустом списке не шлют ничего.
 * Для правки этого мало: отсутствие поля в PUT значит «не менять», и
 * ограничение по типам клиента или поставки нельзя было бы снять обратно в
 * «любой». Поэтому тела собираются здесь.
 *
 * Пустой список критериев:
 *   - создание: поле опускается, отсутствие = «подходит любому» (NULL в БД);
 *   - правка: уходит строка `"[]"`. Она начинается с `[`, и
 *     `parseMultipartList` на бэке вернёт пустой массив, а
 *     `serializeTemplateList` запишет NULL. Пустая строка для этого не
 *     годится: парсер превращает её в `undefined`.
 * Непустой список уходит JSON-строкой в обоих случаях.
 */

const setText = (form: FormData, key: string, value: string | null): void => {
    if (value) form.append(key, value);
};

const setList = (
    form: FormData,
    key: string,
    values: readonly string[],
    emptyMeansReset: boolean,
): void => {
    if (values.length === 0 && !emptyMeansReset) return;
    form.append(key, JSON.stringify(values));
};

/** Тело создания: файл обязателен, пустые списки опускаются. */
export const buildCreateFormData = (
    input: InvoiceTemplateCreateInput,
): FormData => {
    const form = new FormData();
    form.append('name', input.name);
    form.append('visibility', input.visibility);
    setText(form, 'portal_id', input.portalId);
    setText(form, 'agent_id', input.agentId);
    setText(form, 'description', input.description);
    form.append('is_default', String(input.isDefault));
    form.append('is_active', String(input.isActive));
    setText(form, 'creator_bitrix_user_id', input.creatorBitrixUserId);
    setList(form, 'client_types', input.clientTypes, false);
    setList(form, 'supply_types', input.supplyTypes, false);
    form.append('file', input.file);
    return form;
};

/**
 * Тело правки: форма хранит полное состояние, поэтому пустые списки уходят
 * как `"[]"`, а пустое описание как пустая строка (так его можно стереть).
 * Файл прикладывается только новый.
 */
export const buildUpdateFormData = (
    input: InvoiceTemplateUpdateInput,
): FormData => {
    const form = new FormData();
    form.append('name', input.name);
    form.append('visibility', input.visibility);
    setText(form, 'portal_id', input.portalId);
    setText(form, 'agent_id', input.agentId);
    form.append('description', input.description);
    form.append('is_default', String(input.isDefault));
    form.append('is_active', String(input.isActive));
    setList(form, 'client_types', input.clientTypes, true);
    setList(form, 'supply_types', input.supplyTypes, true);
    if (input.file) form.append('file', input.file);
    return form;
};
