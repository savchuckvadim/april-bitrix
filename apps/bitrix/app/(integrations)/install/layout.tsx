import { App } from '@/modules/app';

/**
 * Layout установки приложения из Битрикс24.
 * html/body и шрифты даёт корневой app/layout.tsx — здесь только
 * инициализация приложения в install-режиме.
 */
export default function InstallLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <App isInstall={true}>{children}</App>;
}
