import {
    getKonstructorUserSelectedTemplate,
    type CreateUserSelectedTemplateDto,
} from '@workspace/nest-konstructor-api';
import type {
    CreateUserSelectedTemplateRequest,
    UserSelectedTemplateIdParams,
} from '../../types';

/** Форма запроса (id как string | number) → DTO бэка (числа). */
const toCreateDto = (
    dto: CreateUserSelectedTemplateRequest,
): CreateUserSelectedTemplateDto => ({
    ...dto,
    bitrix_user_id: Number(dto.bitrix_user_id),
    portal_id: Number(dto.portal_id),
    offer_template_id: Number(dto.offer_template_id),
});

/**
 * Выбор Word-шаблона пользователем (текущий / избранный / активный) —
 * единственное место импорта api-пакета для этой части слайса.
 */
export class UserSelectedTemplatesHttp {
    private readonly api = getKonstructorUserSelectedTemplate();

    public async delete(params: UserSelectedTemplateIdParams): Promise<void> {
        await this.api.userSelectedTemplateRemove(Number(params.id));
    }

    public async setCurrent(dto: CreateUserSelectedTemplateRequest): Promise<void> {
        await this.api.userSelectedTemplateSetCurrent(toCreateDto(dto));
    }

    public async setFavorite(
        dto: CreateUserSelectedTemplateRequest,
        is_favorite: boolean,
    ): Promise<void> {
        await this.api.userSelectedTemplateSetFavorite(toCreateDto(dto), {
            is_favorite: String(is_favorite),
        });
    }

    public async setActive(
        dto: CreateUserSelectedTemplateRequest,
        is_active: boolean,
    ): Promise<void> {
        await this.api.userSelectedTemplateSetActiveUserSelectedTemplate(
            toCreateDto(dto),
            { is_active: String(is_active) },
        );
    }
}

export const userSelectedTemplatesHttp = new UserSelectedTemplatesHttp();
