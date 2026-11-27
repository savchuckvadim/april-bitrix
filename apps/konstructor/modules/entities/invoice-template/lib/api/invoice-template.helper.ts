import {
    customAxios,
    getInvoiceTemplates,
    getKonstructorDocumentTemplates,
} from '@workspace/nest-konstructor-api';
import type {
    InvoiceTemplate,
    InvoiceTemplateCreateInput,
    InvoiceTemplateCriteria,
    InvoiceTemplateDto,
    InvoiceTemplateUpdateInput,
    ResolvedInvoiceTemplate,
} from '../../model';
import { buildResolveInvoiceParams } from '../invoice-template-criteria.util';
import {
    buildCreateFormData,
    buildUpdateFormData,
} from '../invoice-template-form-data.util';
import {
    toInvoiceTemplate,
    toResolvedInvoiceTemplate,
} from '../invoice-template.mapper';

const INVOICE_TEMPLATES_PATH = '/api/invoice-templates';

/**
 * Шаблоны счетов и подбор шаблона: ЕДИНСТВЕННОЕ место импорта api-пакета для
 * слайса invoice-template.
 *
 * Клиент orval покрывает чтение, флаги, архив и удаление. Вручную через тот же
 * транспорт `customAxios` сделаны два вызова:
 *   - создание и правка: пустой список критериев должен уйти как `"[]"`, а
 *     сгенерированная сборка multipart на пустом списке не шлёт ничего
 *     (см. `invoice-template-form-data.util.ts`);
 *   - скачивание: сгенерированный метод не просит blob.
 */
export class InvoiceTemplateHelper {
    private templates = getInvoiceTemplates();
    private resolver = getKonstructorDocumentTemplates();

    /** Все общие шаблоны, архив включён. */
    async listPublic(): Promise<InvoiceTemplate[]> {
        const rows = await this.templates.invoiceTemplateFindAll({
            visibility: 'public',
        });
        return rows.map(toInvoiceTemplate);
    }

    /** Все шаблоны портала (портал и поставщики), архив включён. */
    async listByPortal(portalId: string): Promise<InvoiceTemplate[]> {
        const rows = await this.templates.invoiceTemplateFindAll({
            portal_id: portalId,
        });
        return rows.map(toInvoiceTemplate);
    }

    async create(input: InvoiceTemplateCreateInput): Promise<InvoiceTemplate> {
        const row = await customAxios<InvoiceTemplateDto>({
            url: INVOICE_TEMPLATES_PATH,
            method: 'POST',
            headers: { 'Content-Type': 'multipart/form-data' },
            data: buildCreateFormData(input),
        });
        return toInvoiceTemplate(row);
    }

    async update(
        id: string,
        input: InvoiceTemplateUpdateInput,
    ): Promise<InvoiceTemplate> {
        const row = await customAxios<InvoiceTemplateDto>({
            url: `${INVOICE_TEMPLATES_PATH}/${id}`,
            method: 'PUT',
            headers: { 'Content-Type': 'multipart/form-data' },
            data: buildUpdateFormData(input),
        });
        return toInvoiceTemplate(row);
    }

    async remove(id: string): Promise<void> {
        await this.templates.invoiceTemplateRemove(id);
    }

    async setActive(id: string, isActive: boolean): Promise<void> {
        await this.templates.invoiceTemplateSetActive(id, {
            is_active: isActive,
        });
    }

    async setDefault(id: string, isDefault: boolean): Promise<void> {
        await this.templates.invoiceTemplateSetDefault(id, {
            is_default: isDefault,
        });
    }

    async archive(id: string): Promise<void> {
        await this.templates.invoiceTemplateArchive(id);
    }

    async unarchive(id: string): Promise<void> {
        await this.templates.invoiceTemplateUnarchive(id);
    }

    /** Файл шаблона (.docx). */
    async download(id: string): Promise<Blob> {
        return customAxios<Blob>({
            url: `${INVOICE_TEMPLATES_PATH}/${id}/download`,
            method: 'GET',
            responseType: 'blob',
        });
    }

    /** Какой шаблон уйдёт на этих признаках: тот же подбор, что у генерации счёта. */
    async resolve(
        criteria: InvoiceTemplateCriteria,
    ): Promise<ResolvedInvoiceTemplate> {
        const dto = await this.resolver.documentTemplateResolveInvoice(
            buildResolveInvoiceParams(criteria),
        );
        return toResolvedInvoiceTemplate(dto);
    }
}
