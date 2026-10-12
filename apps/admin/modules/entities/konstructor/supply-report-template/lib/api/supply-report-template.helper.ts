/**
 * Транспорт шаблонов отчёта о поставке.
 *
 * ПОЧЕМУ РУКАМИ. Orval-клиента для `/api/supply-report-templates` ещё нет
 * (бэкенд локально не запущен, `pnpm generate` тянет спеку с
 * `localhost:3007/docs/api-json`). Но используется ТОТ ЖЕ мутатор
 * `customAxios` из `@workspace/nest-konstructor-api`, что и у
 * сгенерированных клиентов: тот же baseURL konstructor-бэка, тот же
 * Bearer-токен, та же распаковка конверта `{ resultCode, data, message }`.
 *
 * Поэтому замена на сгенерированный клиент механическая: методы класса
 * один-в-один повторяют маршруты контроллера, меняется только тело метода.
 *
 * ВАЖНО про multipart: FormData собирается здесь (`toMultipartFormData`), а
 * не доверяется генератору. У word-template сгенерированный
 * `wordTemplateUpdate` отправляет ПУСТУЮ FormData (DTO в спеке —
 * `[key: string]: unknown`, orval не нашёл полей), то есть обновление
 * молча ничего не меняет. Своя сборка от этого класса ошибок защищена.
 */
import { customAxios } from '@workspace/nest-konstructor-api';
import { SUPPLY_REPORT_TEMPLATE_API_BASE } from '../../consts/supply-report-template.consts';
import type {
    ICreateSupplyReportTemplateDto,
    ISupplyReportTemplate,
    ISupplyReportTemplatePage,
    ISupplyReportTemplateQuery,
    IUpdateSupplyReportTemplateDto,
} from '../../model';
import {
    toMultipartFormData,
    toQueryParams,
} from '../utils/supply-report-template-form-data';

const MULTIPART_HEADERS = { 'Content-Type': 'multipart/form-data' } as const;

export class SupplyReportTemplateHelper {
    /** `GET /api/supply-report-templates` — страница с `total`. */
    async list(
        query: ISupplyReportTemplateQuery = {},
    ): Promise<ISupplyReportTemplatePage> {
        return customAxios<ISupplyReportTemplatePage>({
            url: SUPPLY_REPORT_TEMPLATE_API_BASE,
            method: 'GET',
            params: toQueryParams({ ...query }),
        });
    }

    /** `GET /common` — только общие (`portal_id IS NULL`). */
    async listCommon(
        query: ISupplyReportTemplateQuery = {},
    ): Promise<ISupplyReportTemplatePage> {
        return customAxios<ISupplyReportTemplatePage>({
            url: `${SUPPLY_REPORT_TEMPLATE_API_BASE}/common`,
            method: 'GET',
            params: toQueryParams({ ...query }),
        });
    }

    /**
     * `GET /portal/:portal_id` — портальные шаблоны ВМЕСТЕ с общими
     * (унаследованными). Это отличается от шаблонов счёта, где общие теряются.
     */
    async listByPortal(
        portalId: string,
        query: ISupplyReportTemplateQuery = {},
    ): Promise<ISupplyReportTemplatePage> {
        return customAxios<ISupplyReportTemplatePage>({
            url: `${SUPPLY_REPORT_TEMPLATE_API_BASE}/portal/${portalId}`,
            method: 'GET',
            params: toQueryParams({ ...query }),
        });
    }

    async get(id: string): Promise<ISupplyReportTemplate> {
        return customAxios<ISupplyReportTemplate>({
            url: `${SUPPLY_REPORT_TEMPLATE_API_BASE}/${id}`,
            method: 'GET',
        });
    }

    /** `GET /:id/download`, `?demo=1` — заполненный пример. */
    async download(id: string, demo = false): Promise<Blob> {
        return customAxios<Blob>({
            url: `${SUPPLY_REPORT_TEMPLATE_API_BASE}/${id}/download`,
            method: 'GET',
            params: demo ? { demo: '1' } : undefined,
            responseType: 'blob',
        });
    }

    async create(
        dto: ICreateSupplyReportTemplateDto,
    ): Promise<ISupplyReportTemplate> {
        return customAxios<ISupplyReportTemplate>({
            url: SUPPLY_REPORT_TEMPLATE_API_BASE,
            method: 'POST',
            headers: MULTIPART_HEADERS,
            data: toMultipartFormData({ ...dto }),
        });
    }

    async update(
        id: string,
        dto: IUpdateSupplyReportTemplateDto,
    ): Promise<ISupplyReportTemplate> {
        return customAxios<ISupplyReportTemplate>({
            url: `${SUPPLY_REPORT_TEMPLATE_API_BASE}/${id}`,
            method: 'PATCH',
            headers: MULTIPART_HEADERS,
            data: toMultipartFormData({ ...dto }),
        });
    }

    /** `PATCH /:id/portal` — `null` переводит шаблон в общие. */
    async setPortal(
        id: string,
        portalId: string | null,
    ): Promise<ISupplyReportTemplate> {
        return customAxios<ISupplyReportTemplate>({
            url: `${SUPPLY_REPORT_TEMPLATE_API_BASE}/${id}/portal`,
            method: 'PATCH',
            data: { portal_id: portalId },
        });
    }

    /** `PATCH /:id/agent` — `null` снимает привязку к поставщику. */
    async setAgent(
        id: string,
        agentId: string | null,
    ): Promise<ISupplyReportTemplate> {
        return customAxios<ISupplyReportTemplate>({
            url: `${SUPPLY_REPORT_TEMPLATE_API_BASE}/${id}/agent`,
            method: 'PATCH',
            data: { agent_id: agentId },
        });
    }

    /**
     * `PATCH /:id/active`. Флаг передаём ЯВНО: у DTO он optional и «не
     * передан» трактуется как `true`, поэтому выключить активность без
     * явного `false` было бы невозможно.
     */
    async setActive(
        id: string,
        isActive: boolean,
    ): Promise<ISupplyReportTemplate> {
        return customAxios<ISupplyReportTemplate>({
            url: `${SUPPLY_REPORT_TEMPLATE_API_BASE}/${id}/active`,
            method: 'PATCH',
            data: { is_active: isActive },
        });
    }

    /** `PATCH /:id/default` — снимает флаг у остальных шаблонов области. */
    async setDefault(
        id: string,
        isDefault = true,
    ): Promise<ISupplyReportTemplate> {
        return customAxios<ISupplyReportTemplate>({
            url: `${SUPPLY_REPORT_TEMPLATE_API_BASE}/${id}/default`,
            method: 'PATCH',
            data: { is_default: isDefault },
        });
    }

    /**
     * `PATCH /:id/archive`. Именно PATCH, а не GET: операция меняет
     * состояние (в word-template архивация ошибочно висит на GET).
     * Архивация снимает `is_default`, разархивация его НЕ возвращает.
     */
    async archive(id: string): Promise<ISupplyReportTemplate> {
        return customAxios<ISupplyReportTemplate>({
            url: `${SUPPLY_REPORT_TEMPLATE_API_BASE}/${id}/archive`,
            method: 'PATCH',
        });
    }

    async unarchive(id: string): Promise<ISupplyReportTemplate> {
        return customAxios<ISupplyReportTemplate>({
            url: `${SUPPLY_REPORT_TEMPLATE_API_BASE}/${id}/unarchive`,
            method: 'PATCH',
        });
    }

    async remove(id: string): Promise<void> {
        return customAxios<void>({
            url: `${SUPPLY_REPORT_TEMPLATE_API_BASE}/${id}`,
            method: 'DELETE',
        });
    }
}
