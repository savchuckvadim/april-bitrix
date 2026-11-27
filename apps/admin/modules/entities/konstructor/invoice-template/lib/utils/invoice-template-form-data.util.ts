/**
 * Сборка multipart-тел шаблона счёта: DTO формы → FormData.
 *
 * Правило пустых списков критериев (`client_types` / `supply_types`) зависит
 * от операции, и перепутать их нельзя:
 *   - создание: пустой список ОПУСКАЕТСЯ, отсутствие поля на бэке означает
 *     «подходит любому» (в БД NULL);
 *   - обновление: пустой список отправляется строкой `"[]"` и означает СБРОС
 *     обратно в «любой». Опустить его здесь нельзя: в PUT отсутствие поля
 *     означает «не менять», и ограничение осталось бы прежним. Строка `"[]"`
 *     начинается с `[`, поэтому `parseMultipartList` на бэке вернёт пустой
 *     массив, а `serializeTemplateList` запишет NULL. Пустая строка `""`
 *     для этого не годится: парсер превращает её в undefined.
 *
 * Непустые списки уходят JSON-строкой в обеих операциях: так делал легаси, и
 * это единственная форма, которой не мешают запятые внутри значений.
 */
import type {
    ICreateInvoiceTemplateDto,
    IUpdateInvoiceTemplateDto,
} from '../../model';

/** Добавляет поле в FormData, только если значение задано. */
const appendOptional = (
    form: FormData,
    key: string,
    value: string | number | boolean | undefined | null,
): void => {
    if (value === undefined || value === null || value === '') {
        return;
    }
    form.append(key, String(value));
};

/**
 * Список критериев → JSON-строка.
 *
 * `emptyMeansReset` различает два смысла пустого списка (см. шапку файла).
 * Незаданный список (`undefined`, `null`) не отправляется никогда.
 */
const appendList = (
    form: FormData,
    key: string,
    values: readonly string[] | undefined | null,
    emptyMeansReset: boolean,
): void => {
    if (!values) {
        return;
    }
    if (values.length === 0 && !emptyMeansReset) {
        return;
    }
    form.append(key, JSON.stringify(values));
};

/** Тело создания: файл обязателен, пустые списки опускаются. */
export const buildCreateInvoiceTemplateFormData = (
    dto: ICreateInvoiceTemplateDto,
): FormData => {
    const form = new FormData();
    form.append('name', dto.name);
    appendOptional(form, 'visibility', dto.visibility);
    appendOptional(form, 'portal_id', dto.portal_id);
    appendOptional(form, 'agent_id', dto.agent_id);
    appendOptional(form, 'description', dto.description);
    appendOptional(form, 'type', dto.type);
    appendOptional(form, 'is_default', dto.is_default);
    appendOptional(form, 'is_active', dto.is_active);
    appendOptional(
        form,
        'creator_bitrix_user_id',
        dto.creator_bitrix_user_id,
    );
    appendList(form, 'client_types', dto.client_types, false);
    appendList(form, 'supply_types', dto.supply_types, false);
    form.append('file', dto.file);
    return form;
};

/** Тело обновления: файл необязателен, пустые списки уходят как `"[]"`. */
export const buildUpdateInvoiceTemplateFormData = (
    dto: IUpdateInvoiceTemplateDto,
): FormData => {
    const form = new FormData();
    appendOptional(form, 'name', dto.name);
    appendOptional(form, 'visibility', dto.visibility);
    appendOptional(form, 'portal_id', dto.portal_id);
    appendOptional(form, 'agent_id', dto.agent_id);
    appendOptional(form, 'description', dto.description);
    appendOptional(form, 'type', dto.type);
    appendOptional(form, 'is_default', dto.is_default);
    appendOptional(form, 'is_active', dto.is_active);
    appendList(form, 'client_types', dto.client_types, true);
    appendList(form, 'supply_types', dto.supply_types, true);
    if (dto.file) {
        form.append('file', dto.file);
    }
    return form;
};
