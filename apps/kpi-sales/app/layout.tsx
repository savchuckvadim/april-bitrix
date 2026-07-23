'use client';
import { Inter } from 'next/font/google';
import '@workspace/ui/globals.css';
// import "@workspace/theme/themes.css"
import { ThemeInitScript } from '@workspace/theme';
import { Providers } from '@/modules/app/providers/Providers';
import { BootPreloader } from '@/modules/app/ui/LoadingScreen/BootPreloader';
import App from '@/modules/app/ui/App';
import { ReportProvider } from '@/modules/widgets/report';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ru" suppressHydrationWarning>
            <body className={inter.className}>
                <ThemeInitScript />
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
            </body>
        </html>
    );
}
