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

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
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
