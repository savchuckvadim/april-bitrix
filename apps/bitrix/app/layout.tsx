import { Geist, Geist_Mono } from 'next/font/google';
import '@workspace/ui/globals.css';
import '@workspace/theme/themes.css';
import { Providers } from '@/components/providers';
import LoadingScreen from '@/modules/shared/components/LoadingScreen/ui/LoadingScreen';
import { Metadata } from 'next';


const fontSans = Geist({
    subsets: ['latin'],
    variable: '--font-sans',
});

const fontMono = Geist_Mono({
    subsets: ['latin'],
    variable: '--font-mono',
});
const description = `Комплексная настройка Bitrix24 под ключ для партнеров НПП Гарант Сервис. Специально для
 отделов продаж и сервиса. Запуск за 2-4 недели. От легендарного разработчика April CRM`;



export const metadata: Metadata = {
    title: 'April CRM — Полная настройка CRM (Битрикс) под ключ',
    description:
        'Комплексная настройка Bitrix24 под ключ для партнеров НПП Гарант Сервис. Автоматизация сделок, звонков, отчетности и KPI. Запуск за 2-4 недели.',
    keywords: [
        'CRM Битрикс',
        'настройка CRM под ключ',
        'автоматизация продаж',
        'KPI отчеты',
        'канбан сделок',
        'внедрение CRM',
    ],
    openGraph: {
        title: 'April CRM — Полная настройка Bitrix24 под ключ',
        description,
        type: 'website',

        url: 'https://bitrix.april-app.ru/home',
        images: [
            {
                url: "https://bitrix.april-app.ru/logo/logo.png",
                width: 330,
                height: 330,
                alt: "Bitrix24 для партнёров ГАРАНТ",
            },
        ],
        siteName: 'Bitrix24 для партнёров ГАРАНТ',

    },
    twitter: {
        card: 'summary_large_image',
        title: 'April CRM — Полная настройка Bitrix24 под ключ',
        description,
    },
};
export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            className="scrollbar-hide"
            lang="en"
            suppressHydrationWarning
        >
            <body
                className={`${fontSans.variable} ${fontMono.variable} scrollbar-hide  font-sans antialiased `}
            >
                <LoadingScreen />
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
