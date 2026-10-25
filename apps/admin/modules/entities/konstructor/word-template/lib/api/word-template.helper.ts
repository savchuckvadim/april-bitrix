import {
    ICreateWordTemplateDto,
    IDepartmentUser,
    INewWordTemplate,
    IUpdateWordTemplateDto,
    IUserSelectedTemplateRequest,
    IUserSelectedTemplateSummary,
    IUserWordTemplatesResponse,
    IWordTemplate,
    IWordTemplateFindAllParams,
    IWordTemplatePortalBinding,
    IWordTemplateSummury,
} from '../../model';
import {
    customAxios,
    getKonstructorWordTemplate,
    getKonstructorWordTemplateTags,
} from '@workspace/nest-konstructor-api';
import { appendWordTemplateCriteria } from '../utils/word-template-criteria-payload';
import {
    normalizePortalIds,
    resolveCreatePortalId,
} from '../utils/word-template-portals-payload';

const WORD_TEMPLATE_API_BASE = '/api/word-templates';
const PORTAL_BINDINGS_API_BASE = '/api/offer-template-portals';
const USER_SELECTED_API_BASE = '/api/user-selected-templates';
const DEPARTMENT_API = '/api/bitrix/department/sales';
const MULTIPART_HEADERS = { 'Content-Type': 'multipart/form-data' } as const;

/**
 * Ручные вызовы (customAxios) там, где сгенерированный клиент либо не знает
 * ручку (привязки порталов, синхронизация, архив через PATCH, отдел продаж),
 * либо собирает multipart неправильно. Замена на генерацию механическая:
 * тела методов меняются, подписи остаются.
 */
export class WordTemplateHelper {
    private api: ReturnType<typeof getKonstructorWordTemplate>;
    private apiTags: ReturnType<typeof getKonstructorWordTemplateTags>;
    constructor() {
        this.api = getKonstructorWordTemplate();
        this.apiTags = getKonstructorWordTemplateTags();
    }

    async list(params: IWordTemplateFindAllParams): Promise<IWordTemplateSummury[]> {
        return this.api.wordTemplateFindAllWordTemplates(params);
    }

    /**
     * Создание шаблона.
     *
     * FormData собирается ЗДЕСЬ, а не сгенерированным клиентом: тот кладёт
     * только поля из спеки и молча выбрасывает критерии. После создания —
     * синхронизация привязок к порталам из мультиселекта (`portal_ids`):
     * бэкенд на create привязывает только один `portal_id`, остальные
     * добавляет `PUT /:id/portals` (идемпотентен, существующую не трогает).
     */
    async create(dto: ICreateWordTemplateDto): Promise<INewWordTemplate> {
        const portalIds = normalizePortalIds(dto.portal_ids, 'create');

        const formData = new FormData();
        formData.append('name', dto.name);
        formData.append('visibility', dto.visibility);
        formData.append('is_default', String(dto.is_default ?? false));
        formData.append('tags', dto.tags ?? '');
        formData.append('is_active', String(dto.is_active ?? false));
        formData.append('portal_id', String(resolveCreatePortalId(dto.portal_id, portalIds)));
        formData.append('user_id', String(dto.user_id ?? 0));
        formData.append('file', dto.file);
        appendWordTemplateCriteria(formData, dto, 'create');

        const created = await customAxios<INewWordTemplate>({
            url: WORD_TEMPLATE_API_BASE,
            method: 'POST',
            headers: MULTIPART_HEADERS,
            data: formData,
        });

        if (portalIds && portalIds.length > 0) {
            await this.syncPortals(String(created.id), portalIds);
        }
        return created;
    }

    /**
     * Обновление шаблона.
     *
     * Своя сборка FormData обязательна: сгенерированный `wordTemplateUpdate`
     * отправляет ПУСТУЮ FormData. Пустая строка/пустой список здесь
     * отправляются: для PATCH это «сбросить», отсутствие поля — «не менять».
     * `portal_ids`: undefined — привязки не трогаем; [] — снять все.
     */
    async update(id: string, dto: IUpdateWordTemplateDto): Promise<IWordTemplate> {
        const formData = new FormData();

        const appendIfDefined = (key: string, value: unknown): void => {
            if (value === undefined || value === null) {
                return;
            }
            if (value instanceof File || value instanceof Blob) {
                formData.append(key, value);
                return;
            }
            formData.append(key, String(value));
        };

        appendIfDefined('name', dto.name);
        appendIfDefined('visibility', dto.visibility);
        appendIfDefined('is_default', dto.is_default);
        appendIfDefined('tags', dto.tags);
        appendIfDefined('is_active', dto.is_active);
        appendIfDefined('portal_id', dto.portal_id);
        appendIfDefined('user_id', dto.user_id);
        appendIfDefined('file', dto.file);
        appendWordTemplateCriteria(formData, dto, 'update');

        const updated = await customAxios<IWordTemplate>({
            url: `${WORD_TEMPLATE_API_BASE}/${id}`,
            method: 'PUT',
            headers: MULTIPART_HEADERS,
            data: formData,
        });

        const portalIds = normalizePortalIds(dto.portal_ids, 'update');
        if (portalIds !== undefined) {
            await this.syncPortals(id, portalIds);
        }
        return updated;
    }

    async download(id: string): Promise<Blob> {
        return customAxios<Blob>({
            url: `${WORD_TEMPLATE_API_BASE}/${id}/download`,
            method: 'GET',
            responseType: 'blob',
        });
    }

    async get(id: string): Promise<IWordTemplate> {
        return this.api.wordTemplateFindOne(id);
    }

    async setActive(id: string): Promise<IWordTemplate> {
        return this.api.wordTemplateSetActiveWordTemplate(id);
    }

    async setDefault(id: string): Promise<IWordTemplate> {
        return this.api.wordTemplateSetDefault(id);
    }

    async remove(id: string): Promise<boolean> {
        return this.api.wordTemplateRemove(id);
    }

    /** Архив через PATCH: мутирующий GET бэкенда оставлен легаси-фронту. */
    async archive(id: string): Promise<boolean> {
        return customAxios<boolean>({ url: `${WORD_TEMPLATE_API_BASE}/${id}/archive`, method: 'PATCH' });
    }

    async unarchive(id: string): Promise<boolean> {
        return customAxios<boolean>({ url: `${WORD_TEMPLATE_API_BASE}/${id}/unarchive`, method: 'PATCH' });
    }

    async findPublic(): Promise<IWordTemplateSummury[]> {
        return this.api.wordTemplateFindPublic();
    }

    /** Шаблоны глазами пользователя: список + его выбор. */
    async findUserTemplates(userId: string, portalId: string): Promise<IUserWordTemplatesResponse> {
        const response = await this.api.wordTemplateFindUserTemplates(userId, portalId);
        return {
            templates: response.templates,
            selected: response.selected as unknown as IUserSelectedTemplateSummary[],
        };
    }

    /** Портальные (visibility=private) шаблоны, привязанные к порталу. Публичные — отдельно, findPublic(). */
    async findByPortal(portalId: string): Promise<IWordTemplateSummury[]> {
        return this.api.wordTemplateFindByPortal(portalId);
    }

    // ---- привязки к порталам (offer_template_portal) ----

    async getPortalBindings(templateId: string): Promise<IWordTemplatePortalBinding[]> {
        return customAxios<IWordTemplatePortalBinding[]>({
            url: `${PORTAL_BINDINGS_API_BASE}/template/${templateId}`,
            method: 'GET',
        });
    }

    async getPortalBindingsByPortal(portalId: string): Promise<IWordTemplatePortalBinding[]> {
        return customAxios<IWordTemplatePortalBinding[]>({
            url: `${PORTAL_BINDINGS_API_BASE}/portal/${portalId}`,
            method: 'GET',
        });
    }

    async syncPortals(templateId: string, portalIds: string[]): Promise<IWordTemplatePortalBinding[]> {
        return customAxios<IWordTemplatePortalBinding[]>({
            url: `${WORD_TEMPLATE_API_BASE}/${templateId}/portals`,
            method: 'PUT',
            data: { portal_ids: portalIds },
        });
    }

    /** Подключить существующий шаблон к порталу — привязка сразу активная. */
    async attachToPortal(templateId: string, portalId: string): Promise<IWordTemplatePortalBinding> {
        return customAxios<IWordTemplatePortalBinding>({
            url: PORTAL_BINDINGS_API_BASE,
            method: 'POST',
            data: {
                offer_template_id: Number(templateId),
                portal_id: Number(portalId),
                is_active: true,
                is_default: false,
            },
        });
    }

    /** Отключить от портала — удаляется ПРИВЯЗКА, сам шаблон остаётся. */
    async detachBinding(bindingId: string): Promise<void> {
        await customAxios<void>({ url: `${PORTAL_BINDINGS_API_BASE}/${bindingId}`, method: 'DELETE' });
    }

    async setBindingActive(bindingId: string, isActive: boolean): Promise<IWordTemplatePortalBinding> {
        return customAxios<IWordTemplatePortalBinding>({
            url: `${PORTAL_BINDINGS_API_BASE}/${bindingId}/active`,
            method: 'PATCH',
            data: { is_active: isActive },
        });
    }

    async setBindingDefault(bindingId: string, isDefault: boolean): Promise<IWordTemplatePortalBinding> {
        return customAxios<IWordTemplatePortalBinding>({
            url: `${PORTAL_BINDINGS_API_BASE}/${bindingId}/default`,
            method: 'PATCH',
            data: { is_default: isDefault },
        });
    }

    // ---- от лица пользователя ----

    async setUserCurrent(req: IUserSelectedTemplateRequest): Promise<unknown> {
        return customAxios<unknown>({
            url: `${USER_SELECTED_API_BASE}/current`,
            method: 'POST',
            data: req,
        });
    }

    async setUserFavorite(req: IUserSelectedTemplateRequest, isFavorite: boolean): Promise<unknown> {
        return customAxios<unknown>({
            url: `${USER_SELECTED_API_BASE}/favorite`,
            method: 'POST',
            params: { is_favorite: String(isFavorite) },
            data: req,
        });
    }

    async setUserActive(req: IUserSelectedTemplateRequest, isActive: boolean): Promise<unknown> {
        return customAxios<unknown>({
            url: `${USER_SELECTED_API_BASE}/active`,
            method: 'POST',
            params: { is_active: String(isActive) },
            data: req,
        });
    }

    /** Пользователи отдела продаж портала (бэкенд кэширует на день). */
    async getDepartmentUsers(domain: string): Promise<IDepartmentUser[]> {
        const response = await customAxios<{ department?: { USERS?: IDepartmentUser[] } }>({
            url: DEPARTMENT_API,
            method: 'POST',
            data: { domain },
        });
        return response?.department?.USERS ?? [];
    }

    // ---- теги ----

    async downloadTags(): Promise<Blob> {
        return customAxios<Blob>({
            url: `/api/word-templates-tags/download`,
            method: 'GET',
            responseType: 'blob',
        });
    }

    async uploadTags(file: File): Promise<void> {
        return this.apiTags.wordTemplateTagsUploadDocumentTagsFile({ file });
    }
}
