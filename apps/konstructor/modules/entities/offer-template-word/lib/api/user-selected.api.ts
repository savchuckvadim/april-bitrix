import { customAxios, getUserSelectedTemplate } from '@workspace/nest-api';
import type {
    CreateUserSelectedTemplateRequest,
    UserSelectedTemplate,
    UserSelectedTemplateCreateBody,
    UserSelectedTemplateIdParams,
    UserSelectedTemplateQueryParams,
} from '../../types';

export class UserSelectedTemplatesHttp {
    private readonly api = getUserSelectedTemplate();

    public fetchList(query?: UserSelectedTemplateQueryParams): Promise<UserSelectedTemplate[]> {
       
        return customAxios<UserSelectedTemplate[]>({
            url: '/api/user-selected-templates',
            method: 'GET',
            params: query,
        });
    }

    public delete(params: UserSelectedTemplateIdParams): Promise<void> {
        return this.api.userSelectedTemplateRemove(Number(params.id));
    }

    public setCurrent(dto: CreateUserSelectedTemplateRequest): Promise<void> {
        return this.api.userSelectedTemplateSetCurrent(dto as unknown as UserSelectedTemplateCreateBody);
    }

    public setFavorite(dto: CreateUserSelectedTemplateRequest, is_favorite: boolean): Promise<void> {
        return this.api.userSelectedTemplateSetFavorite(dto as unknown as UserSelectedTemplateCreateBody, {
            is_favorite: String(is_favorite),
        });
    }

    public setActive(dto: CreateUserSelectedTemplateRequest, is_active: boolean): Promise<void> {
        return this.api.userSelectedTemplateSetActiveUserSelectedTemplate(
            dto as unknown as UserSelectedTemplateCreateBody,
            { is_active: String(is_active) },
        );
    }
}

export const userSelectedTemplatesHttp = new UserSelectedTemplatesHttp();
