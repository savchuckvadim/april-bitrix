import type { CabinetRole } from '@workspace/bitrix';

/** Клиентские тексты кабинета: по-русски, без кодов и жаргона. */
export const ROLE_TITLE: Record<CabinetRole, string> = {
    owner: 'владелец',
    member: 'участник',
    pending: 'заявка',
};

export const PART_TITLE: Record<string, string> = {
    sales: 'Отдел продаж',
    service: 'Отдел сервиса',
};

export const SUPPORT_EMAIL = 'april-app@mail.ru';

export const SITE_LOGIN_URL = 'https://bitrix.april-app.ru/auth/login';

/** Пароль: те же требования, что на сервере. */
export function passwordProblem(password: string): string | null {
    if (password.length < 8) return 'Пароль — не короче 8 символов';
    if (password.length > 72) return 'Пароль — не длиннее 72 символов';
    if (!/\d/.test(password) || !/[^\d\s]/.test(password)) {
        return 'Нужна хотя бы одна цифра и одна буква';
    }
    return null;
}

export function formatDateTime(iso: string): string {
    return new Date(iso).toLocaleString('ru-RU', {
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
    });
}
