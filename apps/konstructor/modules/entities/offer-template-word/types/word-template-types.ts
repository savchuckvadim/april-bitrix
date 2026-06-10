/**
 * Types for Word Template module
 * Based on backend DTOs and entities
 */

import type {
    CreateUserSelectedTemplateDto,
    CreateWordTemplateMultipartDto,
    UserSelectedResponseDto,
    UserSelectedTemplateSummaryDto,
    WordTemplateDto,
    WordTemplateFindAllWordTemplatesParams,
    WordTemplateSummaryDto,
} from "@workspace/nest-api";

/** Mirrors generated list filters; use this at the API boundary instead of importing params DTO elsewhere. */
export type WordTemplateListQuery = WordTemplateFindAllWordTemplatesParams;

/** Single bridge to generated multipart create DTO (e.g. when calling generated create). */
export interface WordTemplateCreateMultipartPayload extends CreateWordTemplateMultipartDto { }

export type UserSelectedTemplateCreateBody = CreateUserSelectedTemplateDto;

export enum WordTemplateVisibility {
    PUBLIC = 'public',
    PORTAL = 'private',
    USER = 'user',
}

export interface UserSelectedResponse extends UserSelectedResponseDto {
    selected: SelectedMetaData[];
    templates: WordTemplateSummary[];
}
export interface WordTemplate extends WordTemplateDto {
    id: string;
    name: string;
    visibility: WordTemplateVisibility | 'public' | 'private' | 'user';
    is_default: boolean;
    file_path: string;
    demo_path?: string;
    type: string;
    code: string;
    tags?: string;
    is_active: boolean;
    is_archived: boolean;
    user_id?: number;
    portal_id?: number;
    counter: number;
    template_url?: string;
    created_at?: string;
    updated_at?: string;
}

export interface WordTemplateSummary extends WordTemplateSummaryDto {
    id: string;
    name: string;
    visibility: WordTemplateVisibility | 'public' | 'private' | 'user';
    is_default: boolean;
    type: string;
    code: string;
    tags?: string;
    is_active: boolean;
    is_archived?: boolean;
    counter: number;
    template_url?: string;
    created_at?: string;
    user_id?: number;
    portal_id?: number;
}
export interface SelectedMetaData extends UserSelectedTemplateSummaryDto {
    template_id: number;
    is_current: boolean;
    is_favorite: boolean;
    is_active: boolean;
    portal_id: number;
    bitrix_user_id: number;
}

export interface UserSelectedTemplate {
    id: string | number;
    bitrix_user_id: string | number;
    portal_id: string | number;
    offer_template_id: string | number;
    is_current: boolean;
    is_favorite: boolean;
    is_active: boolean;
    price_settings?: string;
    infoblock_settings?: string;
    letter_text?: string;
    sale_text_1?: string;
    sale_text_2?: string;
    sale_text_3?: string;
    sale_text_4?: string;
    sale_text_5?: string;
    created_at?: Date | string;
    updated_at?: Date | string;
}

export interface UserSelectedTemplateQueryParams {
    bitrix_user_id?: string | number;
    portal_id?: string | number;
    offer_template_id?: string | number;
    is_current?: boolean;
    is_favorite?: boolean;
    is_active?: boolean;
}

export interface UserSelectedTemplateIdParams {
    id: string | number;
}

export interface CreateUserSelectedTemplateRequest {
    bitrix_user_id: string | number;
    portal_id: string | number;
    offer_template_id: string | number;
    is_current?: boolean;
    is_favorite?: boolean;
    is_active?: boolean;
    price_settings?: string;
    infoblock_settings?: string;
    letter_text?: string;
    sale_text_1?: string;
    sale_text_2?: string;
    sale_text_3?: string;
    sale_text_4?: string;
    sale_text_5?: string;
}

export interface UpdateUserSelectedTemplateRequest
    extends Partial<CreateUserSelectedTemplateRequest> { }

export interface CreateWordTemplateThunkDto {
    file?: File;
    name: string;
    visibility: WordTemplateVisibility | 'public' | 'private' | 'user';
    is_default?: boolean;
    code: string;
    tags?: string;


}

export interface CreateWordTemplateRequest extends CreateWordTemplateThunkDto {
    is_active?: boolean;
    portal_id: number;
    user_id: number;
}

export interface CreateWordTemplateResponse extends WordTemplate { }

export interface UpdateWordTemplateRequest {
    file?: File;
    name?: string;
    visibility?: WordTemplateVisibility | 'public' | 'private' | 'user';
    is_default?: boolean;
    code?: string;
    tags?: string;
    is_active?: boolean;
    portal_id?: number;
    user_id?: number;
}

export interface WordTemplateQueryParams {
    visibility?: WordTemplateVisibility | 'public' | 'private' | 'user';
    portal_id?: string | number;
    is_active?: boolean;
    search?: string;
}

export interface WordTemplateIdParams {
    id: string;
}

export interface WordTemplatePortalIdParams {
    portal_id: string | number;
}

export interface WordTemplateUserPortalParams {
    user_id: string | number;
    portal_id: string | number;
}

