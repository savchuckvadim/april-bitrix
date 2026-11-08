import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Корень сайта ведёт на страницу продукта.
 *
 * Защиты кабинета здесь НЕТ намеренно: сессия кабинета клиента живёт в
 * памяти вкладки, а refresh-cookie выставляет api.pbx на путь своих ручек
 * входа — серверу этого сайта она не видна. Кабинет `/account` закрывает
 * клиентский AccountGate (нет входа → /auth/login). Прежняя проверка
 * cookie `access_token` относилась к кабинету на выведенном из работы
 * back.april-app.ru.
 */
export function middleware(req: NextRequest) {
    if (req.nextUrl.pathname === '/') {
        return NextResponse.redirect(new URL('/home', req.url));
    }
    return NextResponse.next();
}

export const config = {
    matcher: ['/'],
};
