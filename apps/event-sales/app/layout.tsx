import { Geist, Geist_Mono } from 'next/font/google';

import '@workspace/ui/globals.css';

import { ThemeInitScript } from '@workspace/theme';
import { BootPreloader } from '@workspace/april-ui/feedback';
import { Providers } from '@/app/components/providers';

const fontSans = Geist({
    subsets: ['latin'],
    variable: '--font-sans',
});

const fontMono = Geist_Mono({
    subsets: ['latin'],
    variable: '--font-mono',
});

/**
 * Хосты, к которым фрейм пойдёт в первые же секунды: preconnect срезает
 * DNS+TLS-рукопожатие с критического пути (первый запрос настроек/портала
 * стартует уже по тёплому соединению). Значения — те же env, что у
 * api-клиентов; пустой env — дев, preconnect не нужен.
 */
const PRECONNECT_HOSTS = [
    process.env.NEXT_PUBLIC_EVENT_SALES_API_URL,
    // Легаси-бэк захардкожен в @workspace/api (back-api.ts), env у него нет.
    'https://back.april-app.ru/',
]
    .filter((value): value is string => !!value)
    .map(value => {
        try {
            return new URL(value).origin;
        } catch {
            return null;
        }
    })
    .filter((value): value is string => !!value);

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                {PRECONNECT_HOSTS.map(origin => (
                    <link
                        key={origin}
                        rel="preconnect"
                        href={origin}
                        crossOrigin="anonymous"
                    />
                ))}
            </head>
            <body
                className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased `}
            >
                <ThemeInitScript defaultTheme="light" />
                {/*
                 * SSR-прелоадер: виден до загрузки JS. Гасит его App
                 * (modules/app/ui/App) — по готовности данных, а не по факту
                 * гидратации, поэтому BootPreloaderGate здесь не нужен.
                 */}
                <BootPreloader />
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
