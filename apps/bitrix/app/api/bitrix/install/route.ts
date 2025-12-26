import { NextRequest, NextResponse } from 'next/server';
import { getSetupDto } from '../lib/get-dto-by-token-payload.util';
import { redirectToInstall } from './lib/redirect.util';

import { loginByPortal } from '../lib/login-by-portal.helper';
import { getTokenPayLoad } from '../lib/get-token-payload-by-params.util';
import { setupBitrixApp } from './lib/setup';


//install

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
            const result = await setupBitrixApp(data);
            return redirectToInstall(req, 'success');
        }

    } catch (error) {
        console.error('[Bitrix Install] error:', error);
        return redirectToInstall(req, 'fail');

    }
}

export async function GET(req: NextRequest) {
    try {
        const rawBody = await req.text();
        const params = new URLSearchParams(rawBody);

        const tokenPayload = getTokenPayLoad(req, params);





        let installStatus: 'success' | 'fail' = 'fail';

        if (
            tokenPayload.access_token &&
            tokenPayload.refresh_token &&
            tokenPayload.domain
        ) {
            installStatus = tokenPayload.access_token ? 'success' : 'fail';

            // ✅ Сохраняем в Laravel или напрямую
            // await fetch(`${process.env.LARAVEL_API}/api/bitrix/portal/store`, {
            //   method: 'POST',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify({
            //     domain,
            //     member_id: memberId,
            //     access_token: accessToken,
            //     refresh_token: refreshToken,
            //     expires_at: Date.now() + expiresIn * 1000,
            //     application_token: applicationToken,
            //   }),
            // });

            // ✅ Регистрируем плэйсмент
            //     await fetch(`https://${tokenPayload.domain}/rest/placement.bind`, {
            //         method: 'POST',
            //         body: new URLSearchParams({
            //             PLACEMENT: 'DEFAULT',
            //             HANDLER:
            //                 'https://front.april-app.ru/event/app/placement.php',
            //             TITLE: 'Звонки тест Callings',
            //             auth: tokenPayload.access_token,
            //         }),
            //     });
        }

        return redirectToInstall(req, installStatus);
    } catch (error) {
        console.error('[Bitrix Install] error:', error);


        return redirectToInstall(req, 'fail');
    }
}

// export async function POST(req: NextRequest) {
//   try {

//     const requestData: RequestData = {
//       headers: {},
//       body: {},
//       cookies: {},
//       query: '',
//     };

//     // Заголовки запроса
//     // Заголовки запроса
//     req.headers.forEach((value, key) => {
//       requestData.headers[key] = value;
//     });

//     // Парсинг тела как text
//     try {
//       const rawBody = await req.text();
//       const params = new URLSearchParams(rawBody);
//       params.forEach((value, key) => {
//         requestData.body[key] = value;
//       });
//     } catch (err) {
//       console.log('Ошибка при парсинге тела запроса:', err);
//       requestData.body = { error: 'Не удалось распарсить тело запроса' };
//     }

//     // Куки
//     req.cookies.getAll().forEach((cookie) => {
//       requestData.cookies[cookie.name] = cookie.value;
//     });

//     // Параметры запроса
//     requestData.query = req.nextUrl.searchParams.toString();

//     // Логи
//     console.log('INSTALL:', requestData);

//     console.log('Все данные запроса:', requestData);
//     console.log('body:', requestData.body);

//     //запрос на сервер для сохранения токенов
//     //выполнение метода bx sdk app install

//     const response = NextResponse.redirect(new URL('/auth/login', req.url), 303);

//     return response;
//   } catch (error) {
//     console.error('Ошибка обработки запроса:', error);
//     return NextResponse.json({ error: 'Ошибка загрузки файла' }, { status: 500 });
//   }
// }

// export async function GET(req: NextRequest) {
//   console.log(req)
//   return NextResponse.json({ message: 'Этот маршрут поддерживает только POST-запросы' });
// }
