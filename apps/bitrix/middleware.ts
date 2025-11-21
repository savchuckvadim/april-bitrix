import { AUTH_ACCESS_TOKEN_NAME_PUBLIC } from '@workspace/nest-api';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
    const cookie = await req.cookies.get(AUTH_ACCESS_TOKEN_NAME_PUBLIC);

    const token = cookie?.value;
    const url = req.nextUrl;
    const isAuthPage = url.pathname.startsWith('/auth');
    const isProtected = url.pathname.startsWith('/standalone');
    const pathname = url.pathname;


    console.log('token', token);
    console.log('req.nextUrl.pathname', req.nextUrl.pathname);



    // Если нет токена — редирект на логин
    if (!token  && isProtected) {
        console.log('redirect to auth/login');
        return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    if (token && isAuthPage) {
        console.log('redirect to standalone');
        return NextResponse.redirect(new URL('/standalone', req.url));
    }

    // Если есть токен, пропускаем
    return NextResponse.next();
}

export const config = {
    matcher: ['/standalone/:path*', '/auth/:path*'], // защищаем только /standalone
};
