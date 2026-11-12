import type { CreateClientDto, UpdateClientDto } from '@workspace/nest-admin-api';

/** Поля формы клиента — только то, что админ правит руками. */
export interface ClientFormValues {
    name: string;
    email: string;
    isActive: boolean;
}

/**
 * Форма → DTO: пустой email не отправляем, лишних полей (id, порталы,
 * даты) нет — бэк получает ровно название, email и признак «действует».
 */
export function toClientDto(values: ClientFormValues, mode: 'create' | 'edit'): CreateClientDto | UpdateClientDto {
    const email = values.email.trim();
    return {
        name: values.name.trim(),
        ...(email ? { email } : {}),
        ...(mode === 'edit' ? { is_active: values.isActive } : {}),
    };
}
