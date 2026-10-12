/**
 * ТОНКИЙ транспорт шаблонов договора.
 *
 * Почему руками, а не Orval: бэкенд-модуль contract-template написан, но
 * его маршруты ещё не попали в Swagger (`http://localhost:3007/docs/api-json`),
 * а `pnpm generate` в `packages/nest-konstructor-api` требует ПОДНЯТОГО
 * бэкенда. Поэтому здесь ровно то, что сгенерировал бы Orval: вызовы
 * `customAxios` того же мутатора, что у всех остальных клиентов konstructor
 * (он снимает конверт `{ resultCode, data }` и пробрасывает blob как есть).
 *
 * ЗАМЕНА НА ГЕНЕРАЦИЮ механическая: типы лежат отдельно в `../../model`,
 * UI и хуки знают только про имена методов этого класса. Когда появится
 * `getContractTemplates()`, тело методов меняется на вызовы клиента, а
 * подписи остаются.
 *
 * Multipart собирается вручную по той же схеме, что в
 * `generated/invoice-templates/invoice-templates.ts`: boolean → `.toString()`,
 * список → JSON-строка (бэкенд разбирает её `@Transform(parseMultipartList)`),
 * undefined-поля не добавляются вовсе.
 */
import { customAxios } from '@workspace/nest-konstructor-api';
import { CONTRACT_TEMPLATE_API_BASE } from '../../consts/contract-template.consts';
import type {
    IContractTemplate,
    IContractTemplatePage,
    IContractTemplateQuery,
    ICreateContractTemplateDto,
    IUpdateContractTemplateDto,
} from '../../model';

/** Добавляет поле, только если оно задано: `undefined` в multipart стал бы строкой "undefined". */
const appendIfDefined = (
    formData: FormData,
    key: string,
    value: string | boolean | undefined,
): void => {
    if (value === undefined) {
        return;
    }
    formData.append(key, typeof value === 'boolean' ? value.toString() : value);
};

/**
 * Список признаков → JSON-строка.
 *
 * Именно JSON, а не повторяющиеся поля: `parseMultipartList` на бэкенде
 * разбирает строку, начинающуюся с `[`, через `JSON.parse`, и это
 * единственная форма, которая не ломается на значениях с запятой.
 *
 * `emptyMeansReset` различает ДВА разных смысла пустого списка:
 *  - создание (`false`): поле ОПУСКАЕТСЯ, отсутствие = «подходит любому» (NULL);
 *  - обновление (`true`): отправляется строка `'[]'` — это СБРОС обратно
 *    в «любой». Опустить его нельзя: в PATCH отсутствие поля означает
 *    «не менять», и признаки остались бы прежними. Строка `'[]'` начинается
 *    с `[`, поэтому `parseMultipartList` вернёт именно пустой массив
 *    (в отличие от `''`, который он отбрасывает в undefined).
 */
const appendList = (
    formData: FormData,
    key: string,
    values: readonly string[] | undefined,
    emptyMeansReset = false,
): void => {
    if (values === undefined) {
        return;
    }
    if (values.length === 0 && !emptyMeansReset) {
        return;
    }
    formData.append(key, JSON.stringify(values));
};

export const buildCreateFormData = (dto: ICreateContractTemplateDto): FormData => {
    const formData = new FormData();
    formData.append('name', dto.name);
    formData.append('contract_type', dto.contract_type);
    appendIfDefined(formData, 'scope', dto.scope);
    appendIfDefined(formData, 'portal_id', dto.portal_id);
    appendIfDefined(formData, 'agent_id', dto.agent_id);
    appendList(formData, 'client_types', dto.client_types);
    appendList(formData, 'supply_types', dto.supply_types);
    appendIfDefined(formData, 'description', dto.description);
    appendIfDefined(formData, 'is_default', dto.is_default);
    appendIfDefined(formData, 'is_active', dto.is_active);
    appendIfDefined(formData, 'creator_bitrix_user_id', dto.creator_bitrix_user_id);
    formData.append('file', dto.file);
    if (dto.demo) {
        formData.append('demo', dto.demo);
    }
    return formData;
};

/**
 * PATCH-тело в multipart — используется, только когда заменяют файл.
 * Пустые списки признаков уходят как `'[]'` (см. `appendList`), поэтому
 * сброс в «любой» работает и здесь, а не только в JSON-ветке.
 */
export const buildUpdateFormData = (
    dto: IUpdateContractTemplateDto,
    files: { file?: File | null; demo?: File | null },
): FormData => {
    const formData = new FormData();
    appendIfDefined(formData, 'name', dto.name);
    appendIfDefined(formData, 'contract_type', dto.contract_type);
    appendIfDefined(formData, 'portal_id', dto.portal_id);
    appendIfDefined(formData, 'agent_id', dto.agent_id);
    // true: пустой список здесь — осознанный сброс в «любой», а не «нет данных».
    appendList(formData, 'client_types', dto.client_types, true);
    appendList(formData, 'supply_types', dto.supply_types, true);
    appendIfDefined(formData, 'description', dto.description);
    appendIfDefined(formData, 'is_default', dto.is_default);
    appendIfDefined(formData, 'is_active', dto.is_active);
    if (files.file) {
        formData.append('file', files.file);
    }
    if (files.demo) {
        formData.append('demo', files.demo);
    }
    return formData;
};

export class ContractTemplateHelper {
    /** Страница списка: `{ items, total, take, skip }` — пагинация реальная. */
    async list(params: IContractTemplateQuery): Promise<IContractTemplatePage> {
        return customAxios<IContractTemplatePage>({
            url: CONTRACT_TEMPLATE_API_BASE,
            method: 'GET',
            params,
        });
    }

    /** Только общие шаблоны (portal_id IS NULL). */
    async listCommon(): Promise<IContractTemplate[]> {
        return customAxios<IContractTemplate[]>({
            url: `${CONTRACT_TEMPLATE_API_BASE}/common`,
            method: 'GET',
        });
    }

    /**
     * Шаблоны портала ПЛЮС общие (унаследованные).
     * Отличие от версии шаблонов счёта, где общие теряются.
     */
    async listByPortal(portalId: string): Promise<IContractTemplate[]> {
        return customAxios<IContractTemplate[]>({
            url: `${CONTRACT_TEMPLATE_API_BASE}/portal/${portalId}`,
            method: 'GET',
        });
    }

    async get(id: string): Promise<IContractTemplate> {
        return customAxios<IContractTemplate>({
            url: `${CONTRACT_TEMPLATE_API_BASE}/${id}`,
            method: 'GET',
        });
    }

    /** `demo: true` — скачать заполненный пример, а не сам шаблон. */
    async download(id: string, demo = false): Promise<Blob> {
        return customAxios<Blob>({
            url: `${CONTRACT_TEMPLATE_API_BASE}/${id}/download`,
            method: 'GET',
            responseType: 'blob',
            ...(demo ? { params: { demo: 1 } } : {}),
        });
    }

    async create(dto: ICreateContractTemplateDto): Promise<IContractTemplate> {
        return customAxios<IContractTemplate>({
            url: CONTRACT_TEMPLATE_API_BASE,
            method: 'POST',
            data: buildCreateFormData(dto),
        });
    }

    /**
     * Без новых файлов уходит JSON, с файлами — multipart.
     * В ОБЕИХ ветках пустой список признаков доезжает до бэкенда и означает
     * сброс в «любой» (в multipart — как строка `'[]'`).
     */
    async update(
        id: string,
        dto: IUpdateContractTemplateDto,
        files?: { file?: File | null; demo?: File | null },
    ): Promise<IContractTemplate> {
        const hasFiles = Boolean(files?.file || files?.demo);
        return customAxios<IContractTemplate>({
            url: `${CONTRACT_TEMPLATE_API_BASE}/${id}`,
            method: 'PATCH',
            data: hasFiles ? buildUpdateFormData(dto, files ?? {}) : dto,
        });
    }

    /** `null` переводит шаблон в общие. */
    async setPortal(id: string, portalId: string | null): Promise<IContractTemplate> {
        return customAxios<IContractTemplate>({
            url: `${CONTRACT_TEMPLATE_API_BASE}/${id}/portal`,
            method: 'PATCH',
            data: { portal_id: portalId },
        });
    }

    /** `null` снимает привязку к поставщику. */
    async setAgent(id: string, agentId: string | null): Promise<IContractTemplate> {
        return customAxios<IContractTemplate>({
            url: `${CONTRACT_TEMPLATE_API_BASE}/${id}/agent`,
            method: 'PATCH',
            data: { agent_id: agentId },
        });
    }

    async setActive(id: string, isActive: boolean): Promise<IContractTemplate> {
        return customAxios<IContractTemplate>({
            url: `${CONTRACT_TEMPLATE_API_BASE}/${id}/active`,
            method: 'PATCH',
            data: { is_active: isActive },
        });
    }

    async setDefault(id: string, isDefault: boolean): Promise<IContractTemplate> {
        return customAxios<IContractTemplate>({
            url: `${CONTRACT_TEMPLATE_API_BASE}/${id}/default`,
            method: 'PATCH',
            data: { is_default: isDefault },
        });
    }

    /** PATCH, а не GET: операция меняет состояние (у word-template здесь GET — это ошибка). */
    async archive(id: string): Promise<IContractTemplate> {
        return customAxios<IContractTemplate>({
            url: `${CONTRACT_TEMPLATE_API_BASE}/${id}/archive`,
            method: 'PATCH',
        });
    }

    /** Разархивация НЕ возвращает `is_default` — так решено на бэкенде. */
    async unarchive(id: string): Promise<IContractTemplate> {
        return customAxios<IContractTemplate>({
            url: `${CONTRACT_TEMPLATE_API_BASE}/${id}/unarchive`,
            method: 'PATCH',
        });
    }

    async remove(id: string): Promise<void> {
        return customAxios<void>({
            url: `${CONTRACT_TEMPLATE_API_BASE}/${id}`,
            method: 'DELETE',
        });
    }
}
