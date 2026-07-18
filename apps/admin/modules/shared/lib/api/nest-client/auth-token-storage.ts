'use client';

import { AUTH_ACCESS_TOKEN_NAME_PUBLIC } from '@workspace/nest-admin-api';

/**
 * Хранилище access-токена админки (принцип «Bearer везде»):
 * токен живёт в cookie ФРОНТОВОГО домена исключительно ради persistence
 * между перезагрузками и видимости в Next-middleware. На бэки он уходит
 * ТОЛЬКО заголовком Authorization (геттер подключён во все api-пакеты) —
 * на cookie бэки не полагаются (в iframe Битрикса куки ломаются,
 * поэтому куки как транспорт в проекте не используются).
 */

const TOKEN_COOKIE = AUTH_ACCESS_TOKEN_NAME_PUBLIC; // 'access_token'
/** TTL cookie — как у JWT (AUTH_JWT_EXPIRES_IN, по умолчанию 12ч) */
const TOKEN_TTL_SECONDS = 12 * 60 * 60;

export function getAccessToken(): string | null {
    if (typeof document === 'undefined') {
        return null;
    }
    const match = document.cookie
        .split('; ')
        .find(row => row.startsWith(`${TOKEN_COOKIE}=`));
    return match ? decodeURIComponent(match.split('=')[1] ?? '') : null;
}

export function setAccessToken(token: string): void {
    if (typeof document === 'undefined') {
        return;
    }
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${TOKEN_COOKIE}=${encodeURIComponent(token)}; path=/; max-age=${TOKEN_TTL_SECONDS}; SameSite=Lax${secure}`;
}

export function clearAccessToken(): void {
    if (typeof document === 'undefined') {
        return;
    }
    document.cookie = `${TOKEN_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}
