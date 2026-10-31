import { Providers } from '@/modules/app/providers';
import { App } from '@/modules/app/ui/App';
import { AppShell } from '@/modules/widgets/app-shell';

/** Рабочие экраны во фрейме: стор, гейт инициализации Bitrix и общая шапка. */
export default function ShellLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <Providers>
            <App>
                <AppShell>{children}</AppShell>
            </App>
        </Providers>
    );
}
