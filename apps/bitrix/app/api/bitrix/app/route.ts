import { NextRequest, NextResponse } from 'next/server';

interface RequestData {
  headers: Record<string, string>;
  body: Record<string, string>;
  cookies: Record<string, string>;
  query: string;
}


//редирект next из post запроса в апп
export async function POST(req: NextRequest) {
  try {

    const requestData: RequestData = {
      headers: {},
      body: {},
      cookies: {},
      query: '',
    };

    // Заголовки запроса
    // Заголовки запроса
    req.headers.forEach((value, key) => {
      requestData.headers[key] = value;
    });

    // Парсинг тела как text
    try {
      const rawBody = await req.text();
      const params = new URLSearchParams(rawBody);
      params.forEach((value, key) => {
        requestData.body[key] = value;
      });
    } catch (err) {
      console.log('Ошибка при парсинге тела запроса:', err);
      requestData.body = { error: 'Не удалось распарсить тело запроса' };
    }

    // Куки
    req.cookies.getAll().forEach((cookie) => {
      requestData.cookies[cookie.name] = cookie.value;
    });

    // Параметры запроса
    requestData.query = req.nextUrl.searchParams.toString();

    // Логи
    console.log('Все данные запроса  APP');
    console.log('Все данные запроса:', requestData);
    console.log('body:', requestData.body);
    // Корректный редирект с методом GET
    const response = NextResponse.redirect(new URL('/auth/login', req.url), 303);

 

    return response;
  } catch (error) {
    console.error('Ошибка обработки запроса:', error);
    return NextResponse.json({ error: 'Ошибка загрузки файла' }, { status: 500 });
  }
}




export async function GET(req: NextRequest) {
  console.log(req)
  return NextResponse.json({ message: 'Этот маршрут поддерживает только POST-запросы' });
}