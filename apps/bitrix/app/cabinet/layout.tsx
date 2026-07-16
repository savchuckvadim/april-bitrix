import { Geist, Geist_Mono } from 'next/font/google';
import '@workspace/ui/globals.css';
import '@workspace/theme/themes.css';

/**
 * Layout кабинета «Менеджер Гарант» (iframe основного приложения Битрикса).
 *
 * СОЗНАТЕЛЬНО без обёртки <App> (modules/app): легаси-провайдер тянет
 * redux/BitrixService старого кабинета, который инициализируется доменом
 * из локального стора и роняет страницу в iframe (пустой экран,
 * живой тест 2026-07-16). Кабинету маркетплейса нужен чистый контекст —
 * весь контекст портала приходит в query от бэкенд-роутера.
 */

const fontSans = Geist({
    subsets: ['latin'],
    variable: '--font-sans',
});

const fontMono = Geist_Mono({
    subsets: ['latin'],
    variable: '--font-mono',
});

export default function CabinetLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html className="scrollbar-hide" lang="ru" suppressHydrationWarning>
            <body
                className={`${fontSans.variable} ${fontMono.variable} scrollbar-hide font-sans antialiased`}
            >
                {children}
            </body>
        </html>
    );
}
