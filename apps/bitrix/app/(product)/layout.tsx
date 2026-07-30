/**
 * Layout продуктовой зоны (CRM-стиль, без сайт-хедера и футера).
 * Сюда входят страницы продукта: /bitrix/** (iframe-приложение в Битрикс24),
 * /how-we-work, /leads-process, /settings.
 * Если продукту понадобится своя тема — подключать её здесь
 * (обёртка с theme-классом / forcedTheme).
 * Обёртка <App> — только у /bitrix/** (см. bitrix/layout.tsx).
 */
export default function ProductLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <div className="min-h-screen bg-background">{children}</div>;
}
