/**
 * Транспорт шаблонов счетов.
 *
 * Базируется на СГЕНЕРИРОВАННОМ Orval-клиенте (`getInvoiceTemplates()`) —
 * методы чтения, удаления и PATCH-флагов вызываются прямо из него.
 *
 * Два исключения, и оба вынужденные:
 *
 *   1. CREATE / UPDATE собирают multipart ЗДЕСЬ. Сгенерированный
 *      `invoiceTemplateCreate`/`invoiceTemplateUpdate` строит FormData по
 *      снимку swagger, снятому ДО добавления `client_types`/`supply_types`
 *      на бэке, поэтому эти поля он бы молча выбросил. Форма их показывает —
 *      значит они должны доехать. Сборка повторяет генератор поле в поле,
 *      плюс два списка критериев.
 *   2. DOWNLOAD запрашивается через `customAxios` с `responseType: 'blob'`.
 *      Сгенерированный `invoiceTemplateDownload` типизирован как `void` и
 *      не просит blob, то есть файл не сохранить.
 *
 * ПОСЛЕ РЕГЕНЕРАЦИИ (нужен поднятый бэк): если сгенерированные DTO уже несут
 * критерии — заменить `create`/`update` на вызовы клиента и удалить сборку
 * FormData. Остальные методы уже на клиенте и правки не требуют.
 */
import {
    customAxios,
    getInvoiceTemplates,
} from '@workspace/nest-konstructor-api';
import { INVOICE_TEMPLATE_API_PATH } from '../../consts/invoice-template.consts';
import type {
    ICreateInvoiceTemplateDto,
    IInvoiceTemplate,
    IInvoiceTemplateFindAllParams,
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
 * Список критериев в multipart.
 *
 * Повторяющийся ключ — та же форма, которую бэк разбирает
 * `@Transform(parseMultipartList)`. Пустой список здесь не окажется: его
 * отбрасывает нормализация в `lib/utils` (пусто = «любому» = NULL).
 */
const appendList = (
    form: FormData,
    key: string,
    values: readonly string[] | undefined | null,
): void => {
    if (!values || values.length === 0) {
        return;
    }
    for (const value of values) {
        form.append(key, value);
    }
};

export class InvoiceTemplateHelper {
    private api: ReturnType<typeof getInvoiceTemplates>;

    constructor() {
        this.api = getInvoiceTemplates();
    }

    /** Список с СЕРВЕРНОЙ фильтрацией. */
    async list(
        params: IInvoiceTemplateFindAllParams = {},
    ): Promise<IInvoiceTemplate[]> {
        return (await this.api.invoiceTemplateFindAll(
            params,
        )) as IInvoiceTemplate[];
    }

    /** Шаблоны портала. */
    async findByPortal(portalId: string): Promise<IInvoiceTemplate[]> {
        return (await this.api.invoiceTemplateFindByPortal(
            portalId,
        )) as IInvoiceTemplate[];
    }

    /** Публичные шаблоны (visibility=public). */
    async findPublic(): Promise<IInvoiceTemplate[]> {
        return (await this.api.invoiceTemplateFindPublic()) as IInvoiceTemplate[];
    }

    async get(id: string): Promise<IInvoiceTemplate> {
        return (await this.api.invoiceTemplateFindOne(id)) as IInvoiceTemplate;
    }

    async create(dto: ICreateInvoiceTemplateDto): Promise<IInvoiceTemplate> {
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
        appendList(form, 'client_types', dto.client_types);
        appendList(form, 'supply_types', dto.supply_types);
        form.append('file', dto.file);

        return await customAxios<IInvoiceTemplate>({
            url: INVOICE_TEMPLATE_API_PATH,
            method: 'POST',
            headers: { 'Content-Type': 'multipart/form-data' },
            data: form,
        });
    }

    async update(
        id: string,
        dto: IUpdateInvoiceTemplateDto,
    ): Promise<IInvoiceTemplate> {
        const form = new FormData();
        appendOptional(form, 'name', dto.name);
        appendOptional(form, 'visibility', dto.visibility);
        appendOptional(form, 'portal_id', dto.portal_id);
        appendOptional(form, 'agent_id', dto.agent_id);
        appendOptional(form, 'description', dto.description);
        appendOptional(form, 'type', dto.type);
        appendOptional(form, 'is_default', dto.is_default);
        appendOptional(form, 'is_active', dto.is_active);
        appendList(form, 'client_types', dto.client_types);
        appendList(form, 'supply_types', dto.supply_types);
        if (dto.file) {
            form.append('file', dto.file);
        }

        // PUT — так эндпоинт объявлен в сгенерированном клиенте.
        return await customAxios<IInvoiceTemplate>({
            url: `${INVOICE_TEMPLATE_API_PATH}/${id}`,
            method: 'PUT',
            headers: { 'Content-Type': 'multipart/form-data' },
            data: form,
        });
    }

    async remove(id: string): Promise<void> {
        await this.api.invoiceTemplateRemove(id);
    }

    async setActive(id: string, isActive: boolean): Promise<void> {
        await this.api.invoiceTemplateSetActive(id, { is_active: isActive });
    }

    async setDefault(id: string, isDefault: boolean): Promise<void> {
        await this.api.invoiceTemplateSetDefault(id, { is_default: isDefault });
    }

    /**
     * `null` — отвязать портал.
     *
     * Приведение через `as never` вынужденное: Orval развернул `@nullable`-тело
     * в `{ [key: string]: unknown } | null`, поэтому строковый id в него не
     * проходит, хотя бэк ждёт именно строку. Снимется регенерацией после
     * исправления спеки.
     */
    async setPortal(
        id: string,
        portalId: string | null,
    ): Promise<IInvoiceTemplate> {
        return (await this.api.invoiceTemplateSetPortal(id, {
            portal_id: portalId as never,
        })) as IInvoiceTemplate;
    }

    /** `null` — отвязать поставщика. То же приведение, та же причина. */
    async setAgent(
        id: string,
        agentId: string | null,
    ): Promise<IInvoiceTemplate> {
        return (await this.api.invoiceTemplateSetAgent(id, {
            agent_id: agentId as never,
        })) as IInvoiceTemplate;
    }

    async archive(id: string): Promise<void> {
        await this.api.invoiceTemplateArchive(id);
    }

    async unarchive(id: string): Promise<void> {
        await this.api.invoiceTemplateUnarchive(id);
    }

    /** Файл шаблона. Сгенерированный метод не просит blob — поэтому вручную. */
    async download(id: string): Promise<Blob> {
        return await customAxios<Blob>({
            url: `${INVOICE_TEMPLATE_API_PATH}/${id}/download`,
            method: 'GET',
            responseType: 'blob',
        });
    }
}
