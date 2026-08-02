import { Geist, Geist_Mono } from 'next/font/google';

import '@workspace/ui/globals.css';

import { ThemeInitScript } from '@workspace/theme';
import { BootPreloader, BootPreloaderGate } from '@workspace/april-ui/feedback';
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
                <ThemeInitScript />
                {/* SSR-прелоадер: виден до загрузки JS, гасится после гидратации */}
                <BootPreloader />
                <BootPreloaderGate />
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
