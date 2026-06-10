import type {
    CreateUserSelectedTemplateRequest,
    UserSelectedTemplate,
    UserSelectedTemplateIdParams,
    UserSelectedTemplateQueryParams,
} from '../types/word-template-types';
import { userSelectedTemplatesHttp } from './api/user-selected.api';

export const fetchUserSelectedTemplatesAPI = async (
    query?: UserSelectedTemplateQueryParams,
): Promise<UserSelectedTemplate[]> => {
    return userSelectedTemplatesHttp.fetchList(query);
};

export const deleteUserSelectedTemplateAPI = async (
    params: UserSelectedTemplateIdParams,
): Promise<void> => {
    return userSelectedTemplatesHttp.delete(params);
};

export const setCurrentUserSelectedTemplateAPI = async (
    dto: CreateUserSelectedTemplateRequest,
): Promise<void> => {
    return userSelectedTemplatesHttp.setCurrent(dto);
};

export const setFavoriteUserSelectedTemplateAPI = async (
    dto: CreateUserSelectedTemplateRequest,
    is_favorite: boolean,
): Promise<void> => {
    return userSelectedTemplatesHttp.setFavorite(dto, is_favorite);
};

export const setActiveUserSelectedTemplateAPI = async (
    dto: CreateUserSelectedTemplateRequest,
    is_active: boolean,
): Promise<void> => {
    return userSelectedTemplatesHttp.setActive(dto, is_active);
};
