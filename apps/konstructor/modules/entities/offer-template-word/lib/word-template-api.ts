/**
 * Direct API functions for Word Templates
 * These functions make API calls directly and return results
 * Use these instead of thunks when you need the return value
 */
import {
    CreateWordTemplateRequest,
    CreateWordTemplateResponse,
    SelectedMetaData,
    UpdateWordTemplateRequest,
    WordTemplate,
    WordTemplateIdParams,
    WordTemplateListQuery,
    WordTemplatePortalIdParams,
    WordTemplateQueryParams,
    WordTemplateSummary,
    WordTemplateUserPortalParams,
} from '../types/word-template-types';
import { wordTemplateHttp } from './api/template.api';
import { wordTemplateTagsHttp } from './api/template-tags.api';

/**
 * TODO как установить текущий используемый для юзреа
 * как устанвоить текщий для сохраненной сделки - сохранять для сделки во время отправки
 * как ограничить редактирование публичных шаблонов и тех кого создал не текущий пользователь (типа те что для портала)
 *
 *
 */
export interface WordTemplateServerErrorPayload {
    resultCode?: number;
    message?: string;
    errors?: string[];
}

export interface WordTemplateServerError extends Error {
    payload?: WordTemplateServerErrorPayload;
}

function toListQuery(query?: WordTemplateQueryParams): WordTemplateListQuery | undefined {
    if (!query) {
        return undefined;
    }
    return {
        visibility: query.visibility as WordTemplateListQuery['visibility'],
        portal_id: query.portal_id !== undefined ? String(query.portal_id) : undefined,
        is_active: query.is_active,
        search: query.search,
    };
}

function triggerBlobDownload(blob: Blob, fileName: string): void {
    if (!(blob instanceof Blob)) {
        const blobAny = blob as { resultCode?: number; message?: string };
        if (blobAny && typeof blobAny === 'object' && 'resultCode' in blobAny) {
            throw new Error(blobAny.message || 'Failed to download file');
        }
        throw new Error('Invalid response type: expected Blob');
    }
    if (blob.size === 0) {
        throw new Error('Downloaded file is empty');
    }
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
    }, 100);
}

/**
 * Get all word templates with optional filters
 */
export const fetchAllWordTemplates = async (
    query?: WordTemplateQueryParams,
): Promise<WordTemplateSummary[]> => {
    try {
        return await wordTemplateHttp.findAll(toListQuery(query));
    } catch (error) {
        console.error('Error fetching word templates:', error);
        throw error;
    }
};

/**
 * Get public word templates
 */
export const fetchPublicWordTemplates = async (): Promise<WordTemplateSummary[]> => {
    try {
        return await wordTemplateHttp.findPublic();
    } catch (error) {
        console.error('Error fetching public word templates:', error);
        throw error;
    }
};

/**
 * Get word templates by portal
 */
export const fetchWordTemplatesByPortal = async (
    params: WordTemplatePortalIdParams,
): Promise<WordTemplateSummary[]> => {
    try {
        return await wordTemplateHttp.findByPortal(String(params.portal_id));
    } catch (error) {
        console.error('Error fetching word templates by portal:', error);
        throw error;
    }
};

/**
 * Get word templates by user and portal
 */
export const fetchUserWordTemplates = async (
    params: WordTemplateUserPortalParams,
): Promise<{
    templates: WordTemplateSummary[];
    selected: SelectedMetaData[];
}> => {
    try {
        return await wordTemplateHttp.findByUser(String(params.user_id), String(params.portal_id));
    } catch (error) {
        console.error('Error fetching user word templates:', error);
        throw error;
    }
};

/**
 * Get word template by id
 */
export const fetchWordTemplateById = async (params: WordTemplateIdParams): Promise<WordTemplate> => {
    try {
        return await wordTemplateHttp.findById(params.id);
    } catch (error) {
        console.error('Error fetching word template:', error);
        throw error;
    }
};

/**
 * Create word template
 */
export const createWordTemplateAPI = async (
    data: CreateWordTemplateRequest,
): Promise<CreateWordTemplateResponse> => {
    try {
        return await wordTemplateHttp.create(data);
    } catch (error) {
        console.error('Error creating word template:', error);
        throw error;
    }
};

/**
 * Update word template
 */
export const updateWordTemplateAPI = async (
    id: string,
    data: UpdateWordTemplateRequest,
): Promise<WordTemplate> => {
    try {
        return await wordTemplateHttp.update(id, data);
    } catch (error) {
        console.error('Error updating word template:', error);
        throw error;
    }
};

/**
 * Delete word template
 */
export const deleteWordTemplateAPI = async (
    params: WordTemplateIdParams,
    isSuperUser: boolean,
): Promise<void> => {
    try {
        if (isSuperUser) {
            await wordTemplateHttp.delete(params.id);
        } else {
            await wordTemplateHttp.archive(params.id);
        }
    } catch (error) {
        console.error('Error deleting word template:', error);
        throw error;
    }
};

/**
 * Set word template active status
 */
export const setWordTemplateActiveAPI = async (
    id: string,
    is_active: boolean,
): Promise<WordTemplate> => {
    try {
        return await wordTemplateHttp.setActive(id, is_active);
    } catch (error) {
        console.error('Error setting word template active status:', error);
        throw error;
    }
};

/**
 * Set word template as default
 */
export const setWordTemplateDefaultAPI = async (
    id: string,
    is_default: boolean,
): Promise<WordTemplate> => {
    try {
        return await wordTemplateHttp.setDefault(id, is_default);
    } catch (error) {
        console.error('Error setting word template default status:', error);
        throw error;
    }
};

/**
 * Download word template file
 */
export const downloadWordTemplateAPI = async (
    params: WordTemplateIdParams,
    templateName?: string,
): Promise<void> => {
    try {
        const blob = await wordTemplateHttp.downloadTemplate(params.id);
        triggerBlobDownload(blob, `${templateName || 'template'}.docx`);
    } catch (error) {
        console.error('Error downloading word template:', error);
        throw error;
    }
};

export const downloadTagsForTemplatesAPI = async (): Promise<void> => {
    try {
        const blob = await wordTemplateTagsHttp.downloadDocumentTagsFile();
        triggerBlobDownload(blob, 'tags-for-templates.docx');
    } catch (error) {
        console.error('Error downloading tags file:', error);
        throw error;
    }
};

export const uploadTagsForTemplatesAPI = async (file: File): Promise<void> => {
    try {
        await wordTemplateTagsHttp.uploadDocumentTagsFile(file);
    } catch (error) {
        console.error('Error uploading tags file:', error);
        throw error;
    }
};
