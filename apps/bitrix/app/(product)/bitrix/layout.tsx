import { App } from '@/modules/app';

/**
 * Инициализация приложения для iframe-страниц Битрикс24 (/bitrix/**).
 * Остальные страницы (product) в <App> не нуждаются.
 */
export default function BitrixLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <App isInstall={false}>{children}</App>;
}
