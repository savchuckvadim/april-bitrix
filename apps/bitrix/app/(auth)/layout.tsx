/**
 * Layout страниц входа в кабинет клиента (вход, восстановление и установка
 * пароля). Без легаси-провайдера `<App>`: он тянул redux-кабинет на мёртвом
 * back.april-app.ru. Провайдеры и тема — в корневом app/layout.tsx; сессия
 * кабинета — @workspace/bitrix (siteSession, вход через api.pbx).
 */
export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <>{children}</>;
}
