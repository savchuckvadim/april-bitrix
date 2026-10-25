import { AppShell } from '@/modules/widgets/app-shell';

/** Рабочие экраны во фрейме сделки: общая шапка над всеми маршрутами. */
export default function ShellLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <AppShell>{children}</AppShell>;
}
