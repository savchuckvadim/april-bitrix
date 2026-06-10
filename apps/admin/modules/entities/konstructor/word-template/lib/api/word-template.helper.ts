// import { CreateWordTemplateRequestDto, getKonstructorWordTemplate, UpdateWordTemplateDto, WordTemplateFindAllWordTemplatesParams } from "@workspace/nest-api";
import { ICreateWordTemplateDto, INewWordTemplate, IUpdateWordTemplateDto, IWordTemplate, IWordTemplateFindAllParams, IWordTemplateSummury } from "../../model";
import { customAxios, getKonstructorWordTemplate, getKonstructorWordTemplateTags } from "@workspace/nest-api";

export class WordTemplateHelper {
    private api: ReturnType<typeof getKonstructorWordTemplate>;
    private apiTags: ReturnType<typeof getKonstructorWordTemplateTags>;
    constructor() {
        this.api = getKonstructorWordTemplate();
        this.apiTags = getKonstructorWordTemplateTags();
    }

    async list(params: IWordTemplateFindAllParams): Promise<IWordTemplateSummury[]> {
        const response = await this.api.wordTemplateFindAllWordTemplates(params);
        return response;
    }


    async create(dto: ICreateWordTemplateDto): Promise<INewWordTemplate> {
        const normalizedDto: ICreateWordTemplateDto = {
            ...dto,
            // Generator always calls toString() for these fields in multipart payload.
            // Keep safe defaults for non-portal/non-user templates.
            portal_id: dto.portal_id ?? 0,
            user_id: dto.user_id ?? 0,
            tags: dto.tags ?? '',
        };

        const response = await this.api.wordTemplateCreateWordTemplate(normalizedDto);
        return response;
    }

    async update(id: string, dto: IUpdateWordTemplateDto): Promise<IWordTemplate> {
        const response = await this.api.wordTemplateUpdate(id, dto);
        return response;
    }
    async download(id: string): Promise<Blob> {
        const response = await customAxios<Blob>({
            url: `/api/word-templates/${id}/download`,
            method: "GET",
            responseType: "blob",
        });
        return response;
    }

    async get(id: string): Promise<IWordTemplate> {
        const response = await this.api.wordTemplateFindOne(id);
        return response;
    }

    async setActive(id: string): Promise<IWordTemplate> {
        const response = await this.api.wordTemplateSetActiveWordTemplate(id);
        return response;
    }
    async setDefault(id: string): Promise<IWordTemplate> {
        const response = await this.api.wordTemplateSetDefault(id);
        return response;
    }
    async remove(id: string): Promise<void> {
        const response = await this.api.wordTemplateRemove(id);
        return response;
    }

    async findPublic(): Promise<IWordTemplateSummury[]> {
        const response = await this.api.wordTemplateFindPublic();
        return response;
    }
    async findUserTemplates(userId: string, portalId: string): Promise<IWordTemplateSummury[]> {
        // wordTemplateFindUserTemplates now returns a UserSelectedResponseDto
        // ({ templates, selected }); the helper contract is the templates array.
        // `selected` (user's chosen templates) is available here if needed later.
        const response = await this.api.wordTemplateFindUserTemplates(userId, portalId);
        return response.templates;
    }
    async findByPortal(portalId: string): Promise<IWordTemplateSummury[]> {
        const response = await this.api.wordTemplateFindByPortal(portalId);
        return response;
    }


    async downloadTags(): Promise<Blob> {
        const response = await customAxios<Blob>({
            url: `/api/word-templates-tags/download`,
            method: "GET",
            responseType: "blob",
        });
        return response;
    }
    async uploadTags(file: File): Promise<void> {
        const response = await this.apiTags.wordTemplateTagsUploadDocumentTagsFile({ file });
        return response;
    }





}
