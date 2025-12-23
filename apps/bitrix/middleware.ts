import { AUTH_ACCESS_TOKEN_NAME_PUBLIC } from '@workspace/nest-api';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
    const cookie = await req.cookies.get(AUTH_ACCESS_TOKEN_NAME_PUBLIC);

    const token = cookie?.value;
    const url = req.nextUrl;
    const isSomePage = url.pathname === '/';
    if (isSomePage) {
        return NextResponse.redirect(new URL('/home', req.url));
    }
    const isAuthPage = url.pathname.startsWith('/auth');
    const isProtected = url.pathname.startsWith('/standalone');
    // const isHomePage = url.pathname.startsWith('/home');
    // const isFavicon = url.pathname.startsWith('/favicon.ico');
    // const isLogo = url.pathname.startsWith('/logo');
    // const isApi = url.pathname.startsWith('/api');
    // const isNext = url.pathname.startsWith('/_next');
    // const isStatic = url.pathname.startsWith('/static');
    // const isPublic = url.pathname.startsWith('/public');
    // const isImages = url.pathname.startsWith('/images');
    // const isStyles = url.pathname.startsWith('/styles');
    // const isFonts = url.pathname.startsWith('/fonts');
    // const isOffers = url.pathname.startsWith('/offer');
    // const isVideos = url.pathname.startsWith('/video');
    // const isAudio = url.pathname.startsWith('/audio');
    // const isDocuments = url.pathname.startsWith('/document');
    // const isDemo = url.pathname.startsWith('/demo');

    // const isHtml = url.pathname.startsWith('/html');
    // const pathname = url.pathname;
    // если путь НЕ home, НЕ standalone и НЕ auth → редирект на /home
    // if (!isHomePage && !isProtected && !isAuthPage && !isFavicon && !isLogo &&
    //     !isApi && !isNext && !isStatic && !isPublic && !isImages && !isStyles &&
    //     !isFonts && !isOffers && !isVideos && !isAudio && !isDocuments && !isDemo &&
    //     !isHtml) {
    //     url.pathname = '/home';
    //     return NextResponse.redirect(url);
    // }

    console.log('token', token);
    console.log('req.nextUrl.pathname', req.nextUrl.pathname);



    // Если нет токена — редирект на логин
    if (!token && isProtected) {
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
    matcher: [
        '/',
        '/standalone/:path*',
        '/auth/:path*',
        '/home'
    ], // защищаем только /standalone
};
