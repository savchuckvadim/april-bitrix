import { AUTH_ACCESS_TOKEN_NAME_PUBLIC } from '@workspace/nest-api';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
    const cookie = await req.cookies.get(AUTH_ACCESS_TOKEN_NAME_PUBLIC);

    const token = cookie?.value;

    console.log('token', token);
    console.log('req.nextUrl.pathname', req.nextUrl.pathname);
    // Если нет токена — редирект на логин
    if (!token && req.nextUrl.pathname.startsWith('/public')) {
        return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    // Если есть токен, пропускаем
    return NextResponse.next();
}

export const config = {
    matcher: ['/public/:path*'], // защищаем только /public
};
