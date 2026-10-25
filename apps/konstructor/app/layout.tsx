import { Geist, Geist_Mono } from 'next/font/google';

import '@workspace/ui/globals.css';
import '@/style/print.css';
import '@/style/fonts.css';
import { ThemeInitScript } from '@workspace/theme';
import { BootPreloader } from '@workspace/april-ui/feedback';
import { Providers } from '@/modules/app/providers';
import { App } from '@/modules/app/ui/App';

const fontSans = Geist({
    subsets: ['latin'],
    variable: '--font-sans',
});

const fontMono = Geist_Mono({
    subsets: ['latin'],
    variable: '--font-mono',
});

/**
 * Корень: тема до гидратации, единый boot-прелоадер, провайдеры и гейт
 * инициализации Bitrix. Каркас экранов — в app/(shell)/layout.tsx.
 * Карта маршрутов — docs/routing.md.
 */
export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ru" suppressHydrationWarning>
            <body
                className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased`}
            >
                <ThemeInitScript defaultTheme="light" />
                {/* SSR-прелоадер: виден до загрузки JS, гасится из App */}
                <BootPreloader />
                <Providers>
                    <App>{children}</App>
                </Providers>
            </body>
        </html>
    );
}
