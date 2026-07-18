import { AUTH_ACCESS_TOKEN_NAME_PUBLIC } from '@workspace/nest-admin-api';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * SSR-гейт админки: страницы (кроме /auth/*) требуют cookie access_token
 * с непросроченным exp. Это ПЕРВАЯ линия (мгновенный редирект без
 * рендера); криптографическую проверку подписи делает бэк на каждом
 * запросе (Bearer) — middleware лишь декодирует payload, отсеивая
 * отсутствующий/протухший токен.
 */

/** exp из JWT (секунды unix) без верификации подписи; null — не разобрать */
function readJwtExp(token: string): number | null {
    try {
        const payload = token.split('.')[1];
        if (!payload) {
            return null;
        }
        const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
        const parsed = JSON.parse(json) as { exp?: number };
        return typeof parsed.exp === 'number' ? parsed.exp : null;
    } catch {
        return null;
    }
}

function isTokenAlive(token: string | undefined): boolean {
    if (!token) {
        return false;
    }
    const exp = readJwtExp(token);
    // без exp токен считаем живым — решит бэк (401 → интерцептор)
    return exp === null || exp * 1000 > Date.now();
}

export function middleware(req: NextRequest) {
    const token = req.cookies.get(AUTH_ACCESS_TOKEN_NAME_PUBLIC)?.value;
    const { pathname, search } = req.nextUrl;
    const isAuthPage = pathname.startsWith('/auth');
    const alive = isTokenAlive(token);

    // Уже вошли и пришли на логин — сразу в приложение
    if (isAuthPage && alive) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    // Нет живого токена на защищённой странице — на логин с возвратом
    if (!isAuthPage && !alive) {
        const login = new URL('/auth/login', req.url);
        login.searchParams.set('returnTo', pathname + search);
        return NextResponse.redirect(login);
    }
    return NextResponse.next();
}

export const config = {
    // всё, кроме статики Next, файлов с расширением и favicon
    matcher: ['/((?!_next|favicon\\.ico|.*\\..*).*)'],
};
