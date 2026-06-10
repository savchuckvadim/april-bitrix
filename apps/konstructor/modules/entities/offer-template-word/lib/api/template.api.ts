import { customAxios, getKonstructorWordTemplate } from '@workspace/nest-api';
import type {
    CreateWordTemplateRequest,
    UpdateWordTemplateRequest,
    UserSelectedResponse,
    WordTemplate,
    WordTemplateListQuery,
    WordTemplateSummary,
} from '../../types';

function appendCreateFields(formData: FormData, data: CreateWordTemplateRequest): void {
    if (data.file) {
        formData.append('file', data.file);
    }
    formData.append('name', data.name);
    formData.append('code', data.code);
    if (data.visibility) {
        formData.append('visibility', data.visibility);
    }
    if (data.is_default !== undefined) {
        formData.append('is_default', String(data.is_default));
    }
    if (data.tags) {
        formData.append('tags', data.tags);
    }
    if (data.is_active !== undefined) {
        formData.append('is_active', String(data.is_active));
    }
    formData.append('portal_id', String(data.portal_id));
    formData.append('user_id', String(data.user_id));
}

function appendUpdateFields(formData: FormData, data: UpdateWordTemplateRequest): void {
    if (data.file) {
        formData.append('file', data.file);
    }
    if (data.name) {
        formData.append('name', data.name);
    }
    if (data.code) {
        formData.append('code', data.code);
    }
    if (data.visibility) {
        formData.append('visibility', data.visibility);
    }
    if (data.is_default !== undefined) {
        formData.append('is_default', String(data.is_default));
    }
    if (data.tags !== undefined) {
        formData.append('tags', data.tags || '');
    }
    if (data.is_active !== undefined) {
        formData.append('is_active', String(data.is_active));
    }
    if (data.portal_id !== undefined) {
        formData.append('portal_id', String(data.portal_id));
    }
    if (data.user_id !== undefined) {
        formData.append('user_id', String(data.user_id));
    }
}

export class OfferWordTemplateAPI {
    private readonly api = getKonstructorWordTemplate();

    public findAll(query?: WordTemplateListQuery): Promise<WordTemplateSummary[]> {
        return this.api.wordTemplateFindAllWordTemplates(query);
    }

    public findPublic(): Promise<WordTemplateSummary[]> {
        return this.api.wordTemplateFindPublic();
    }

    public findByPortal(portalId: string): Promise<WordTemplateSummary[]> {
        return this.api.wordTemplateFindByPortal(portalId);
    }

    public findByUser(userId: string, portalId: string): Promise<UserSelectedResponse> {
        return this.api.wordTemplateFindUserTemplates(userId, portalId);
    }

    public findById(id: string): Promise<WordTemplate> {
        return this.api.wordTemplateFindOne(id);
    }

    /**
     * Uses multipart FormData (includes `code`); generated `wordTemplateCreate` omits `code` in its FormData.
     */
    public async create(data: CreateWordTemplateRequest): Promise<WordTemplate> {
        const formData = new FormData();
        appendCreateFields(formData, data);
        return customAxios<WordTemplate>({
            url: '/api/word-templates',
            method: 'POST',
            headers: { 'Content-Type': 'multipart/form-data' },
            data: formData,
        });
    }

    /** Generated update sends an empty FormData; build fields here. */
    public async update(id: string, data: UpdateWordTemplateRequest): Promise<WordTemplate> {
        const formData = new FormData();
        appendUpdateFields(formData, data);
        return customAxios<WordTemplate>({
            url: `/api/word-templates/${id}`,
            method: 'PUT',
            headers: { 'Content-Type': 'multipart/form-data' },
            data: formData,
        });
    }

    public delete(id: string): Promise<void> {
        return this.api.wordTemplateRemove(id);
    }

    public downloadTemplate(id: string): Promise<Blob> {
        return this.api.wordTemplateDownloadTemplate(id);
    }

    public archive(id: string): Promise<void> {
        return this.api.wordTemplateArchive(id);
    }

    public unarchive(id: string): Promise<void> {
        return this.api.wordTemplateUnarchive(id);
    }

    public setActive(id: string, is_active: boolean): Promise<WordTemplate> {

        return customAxios<WordTemplate>({
            url: `/api/word-templates/${id}/active`,
            method: 'PATCH',
            data: { is_active },
        });
    }

    public setDefault(id: string, is_default: boolean): Promise<WordTemplate> {
        return customAxios<WordTemplate>({
            url: `/api/word-templates/${id}/default`,
            method: 'PATCH',
            data: { is_default },
        });
    }
}

export const wordTemplateHttp = new OfferWordTemplateAPI();
