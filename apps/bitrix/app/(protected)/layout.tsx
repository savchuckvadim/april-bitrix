import { App } from '@/modules/app';

/**
 * Layout защищённой зоны (личный кабинет /standalone).
 * Доступ контролирует middleware по токену.
 */
export default function ProtectedLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <App isInstall={false}>{children}</App>;
}
