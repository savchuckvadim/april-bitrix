import { Geist, Geist_Mono } from 'next/font/google';

import '@workspace/ui/globals.css';
import { Providers } from '@/components/providers';

/**
 * Кириллица.
 *
 * Geist отдаёт cyrillic и cyrillic-ext, но каталог шрифтов, вшитый в
 * next 15.3.6 (compiled/@next/font/dist/google/font-data.json), знает только
 * latin и latin-ext — поэтому `subsets: ['cyrillic']` роняет сборку, а
 * `subsets: ['latin']` оставляет русский текст на системном фолбэке.
 *
 * Обходим это, не указывая subsets вовсе: next/font запрашивает CSS без
 * параметра subset, Google отдаёт @font-face на все подмножества с
 * unicode-range, браузер качает только нужный кусок. Платим отключённым
 * preload — иначе next требует явного списка subsets. Тот же приём и с той же
 * причиной применён в `apps/bitrix/app/layout.tsx`.
 */
const fontSans = Geist({
    preload: false,
    variable: '--font-sans',
});

const fontMono = Geist_Mono({
    preload: false,
    variable: '--font-mono',
});

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ru" suppressHydrationWarning>
            <body
                className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased `}
            >
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
