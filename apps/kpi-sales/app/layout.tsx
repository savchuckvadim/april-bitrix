'use client';
import { Inter } from 'next/font/google';
import '@workspace/ui/globals.css';
// import "@workspace/theme/themes.css"
import { usePathname } from 'next/navigation';
import { ThemeInitScript } from '@workspace/theme';
import { Providers } from '@/modules/app/providers/Providers';
import { BootPreloader } from '@workspace/april-ui/feedback';
import App from '@/modules/app/ui/App';
import { ReportProvider } from '@/modules/widgets/report';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    // Публичная страница /share/[token]: без Bitrix-init (App) и каркаса
    // отчёта (ReportProvider) — только стор и темы. Данные сидятся снимком.
    const isPublicShare = pathname?.startsWith('/share');

    return (
        <html lang="ru" suppressHydrationWarning>
            <body className={inter.className}>
                <ThemeInitScript />
                {isPublicShare ? (
                    <Providers>
                        <main className="min-h-screen bg-background">
                            {children}
                        </main>
                    </Providers>
                ) : (
                    <>
                        {/* SSR-прелоадер: виден до загрузки JS, гасится из App */}
                        <BootPreloader />
                        <Providers>
                            <main className="min-h-screen bg-background">
                                <App>
                                    <ReportProvider>
                                        {children}
                                    </ReportProvider>
                                </App>
                            </main>
                        </Providers>
                    </>
                )}
            </body>
        </html>
    );
}
