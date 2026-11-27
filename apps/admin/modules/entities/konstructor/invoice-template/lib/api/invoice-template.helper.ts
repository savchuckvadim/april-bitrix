/**
 * Транспорт шаблонов счетов.
 *
 * Базируется на СГЕНЕРИРОВАННОМ Orval-клиенте (`getInvoiceTemplates()`) —
 * методы чтения, удаления и PATCH-флагов вызываются прямо из него.
 *
 * Два исключения, и оба вынужденные:
 *
 *   1. CREATE / UPDATE собирают multipart в `buildCreateInvoiceTemplateFormData`
 *      и `buildUpdateInvoiceTemplateFormData`. Сгенерированные
 *      `invoiceTemplateCreate`/`invoiceTemplateUpdate` кладут список критериев
 *      повторяющимися полями, а на пустом списке не шлют ничего: ограничение
 *      по типам клиента и поставки нельзя было бы снять обратно в «любой».
 *      Ручная сборка отправляет пустой список как `"[]"` (правило — в шапке
 *      `invoice-template-form-data.util.ts`).
 *   2. DOWNLOAD запрашивается через `customAxios` с `responseType: 'blob'`.
 *      Сгенерированный `invoiceTemplateDownload` типизирован как `void` и
 *      не просит blob, то есть файл не сохранить.
 *
 * ПОСЛЕ ИСПРАВЛЕНИЯ ГЕНЕРАТОРА (пустой список в multipart) `create`/`update`
 * можно заменить вызовами клиента. Остальные методы уже на клиенте.
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
import {
    buildCreateInvoiceTemplateFormData,
    buildUpdateInvoiceTemplateFormData,
} from '../utils/invoice-template-form-data.util';

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
        return await customAxios<IInvoiceTemplate>({
            url: INVOICE_TEMPLATE_API_PATH,
            method: 'POST',
            headers: { 'Content-Type': 'multipart/form-data' },
            data: buildCreateInvoiceTemplateFormData(dto),
        });
    }

    async update(
        id: string,
        dto: IUpdateInvoiceTemplateDto,
    ): Promise<IInvoiceTemplate> {
        // PUT — так эндпоинт объявлен в сгенерированном клиенте.
        return await customAxios<IInvoiceTemplate>({
            url: `${INVOICE_TEMPLATE_API_PATH}/${id}`,
            method: 'PUT',
            headers: { 'Content-Type': 'multipart/form-data' },
            data: buildUpdateInvoiceTemplateFormData(dto),
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
