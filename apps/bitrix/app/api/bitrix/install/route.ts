import { NextRequest, NextResponse } from 'next/server';

interface RequestData {
  headers: Record<string, string>;
  body: Record<string, string>;
  cookies: Record<string, string>;
  query: string;
}


//install

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const params = new URLSearchParams(rawBody);

    const accessToken = params.get('AUTH_ID');
    const refreshToken = params.get('REFRESH_ID');
    const expiresIn = Number(params.get('AUTH_EXPIRES'));
    const domain = req.nextUrl.searchParams.get('DOMAIN');
    const memberId = params.get('member_id');
    const applicationToken = params.get('application_token');
    console.log('INSTALL: accessToken', accessToken);
    console.log('INSTALL: refreshToken', refreshToken);
    console.log('INSTALL: expiresIn', expiresIn);
    console.log('INSTALL: domain', domain);
    console.log('INSTALL: memberId', memberId);
    console.log('INSTALL: applicationToken', applicationToken);
   

    if (!accessToken || !refreshToken || !memberId || !domain) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

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
    await fetch(`https://${domain}/rest/placement.bind`, {
      method: 'POST',
      body: new URLSearchParams({
        PLACEMENT: 'DEFAULT',
        HANDLER: 'https://front.april-app.ru/event/app/placement.php',
        TITLE: 'Звонки тест Callings',
        auth: accessToken,
      }),
    });

    // ✅ Возвращаем корректный ответ
    return NextResponse.json({ result: true });
  } catch (error) {
    console.error('[Bitrix Install] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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