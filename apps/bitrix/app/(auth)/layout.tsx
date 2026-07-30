import { App } from '@/modules/app';

export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <App isInstall={false}>{children}</App>;
}
