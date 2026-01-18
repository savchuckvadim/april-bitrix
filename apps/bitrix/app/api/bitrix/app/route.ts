import { NextRequest, NextResponse } from 'next/server';
import { redirectToApp } from './redirect.util';
import { getTokenPayLoad } from '../lib/get-token-payload-by-params.util';
import { getSetupDto } from '../lib/get-dto-by-token-payload.util';
import { loginByPortal } from '../lib/login-by-portal.helper';

interface RequestData {
    headers: Record<string, string>;
    body: Record<string, string>;
    cookies: Record<string, string>;
    query: string;
}

//редирект next из post запроса в апп
export async function POST(req: NextRequest) {
    try {
        const rawBody = await req.text();
        const params = new URLSearchParams(rawBody);

        const tokenPayload = getTokenPayLoad(req, params);

        if (
            tokenPayload.access_token &&
            tokenPayload.refresh_token &&
            tokenPayload.domain
        ) {
            const data = getSetupDto(tokenPayload);
            const result = await loginByPortal(data);
            return redirectToApp(req);
        }

        return redirectToApp(req);
    } catch (error) {
        console.error('[Bitrix App] error:', error);
        return redirectToApp(req);
    }
    //     const requestData: RequestData = {
    //         headers: {},
    //         body: {},
    //         cookies: {},
    //         query: '',
    //     };

    //     // Заголовки запроса
    //     // Заголовки запроса
    //     req.headers.forEach((value, key) => {
    //         requestData.headers[key] = value;
    //     });

    //     // Парсинг тела как text
    //     try {
    //         const rawBody = await req.text();
    //         const params = new URLSearchParams(rawBody);
    //         params.forEach((value, key) => {
    //             requestData.body[key] = value;
    //         });
    //     } catch (err) {
    //         console.log('Ошибка при парсинге тела запроса:', err);
    //         requestData.body = { error: 'Не удалось распарсить тело запроса' };
    //     }

    //     // Куки
    //     req.cookies.getAll().forEach(cookie => {
    //         requestData.cookies[cookie.name] = cookie.value;
    //     });

    //     // Параметры запроса
    //     requestData.query = req.nextUrl.searchParams.toString();

    //     // Логи
    //     console.log('Все данные запроса  APP');
    //     console.log('Все данные запроса:', requestData);
    //     console.log('body:', requestData.body);
    //     // Корректный редирект с методом GET
    //     // const response = NextResponse.redirect(
    //     //     new URL('/bitrix', req.url),
    //     //     303,
    //     // );

    //     return redirectToApp(req);
    // } catch (error) {
    //     console.error('Ошибка обработки запроса:', error);
    //     return redirectToApp(req);
    // }
}

export async function GET(req: NextRequest) {
    return redirectToApp(req);
}
