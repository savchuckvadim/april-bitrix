import { Geist, Geist_Mono } from 'next/font/google';
import '@workspace/ui/globals.css';
import '@workspace/theme/themes.css';
import { Providers } from '@/components/providers';
import { ThemeInitScript } from '@workspace/theme';
import { BootPreloader, BootPreloaderGate } from '@workspace/april-ui/feedback';
import { Metadata } from 'next';
import { YANDEX_ID, YandexMetrika } from '@/components/metrika';


/**
 * Кириллица.
 *
 * Geist давно отдаёт cyrillic и cyrillic-ext, но каталог шрифтов, вшитый в
 * next 15.3.6 (compiled/@next/font/dist/google/font-data.json), знает только
 * latin и latin-ext — поэтому `subsets: ['cyrillic']` роняет сборку.
 *
 * Обходим это, не указывая subsets вовсе: тогда next/font запрашивает CSS без
 * параметра subset, Google отдаёт @font-face на ВСЕ подмножества с unicode-range,
 * и next самостоятельно хостит их все. Браузер скачивает только нужный кусок.
 * Платим за это отключённым preload — иначе next требует явного списка subsets.
 *
 * Когда каталог в next обновится, здесь можно будет вернуть
 * `subsets: ['latin', 'cyrillic']` и `preload: true`.
 */
const fontSans = Geist({
    preload: false,
    variable: '--font-sans',
});

const fontMono = Geist_Mono({
    preload: false,
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
            {/* <YandexMetrika /> */}
            <body
                className={`${fontSans.variable} ${fontMono.variable} scrollbar-hide  font-sans antialiased `}
            >
                {/*
                 * Тема до гидратации: сервер localStorage не видит и отдаёт
                 * страницу нейтральной, поэтому без этого скрипта первый кадр
                 * светлый и через мгновение перекрашивается в air-dark.
                 * Значение обязано совпадать с defaultTheme в components/providers.
                 */}
                <ThemeInitScript defaultTheme="air-dark" />
                {/*
                 * SSR boot-прелоадер: приходит в первом HTML-чанке, виден до
                 * загрузки бандлов. Заменил прежний клиентский LoadingScreen —
                 * тот держал экран фиксированные 2с и сам тянул framer-motion,
                 * WebGL-Orb и next/image, то есть появлялся ПОЗЖЕ всего, что
                 * скрывал, и портил LCP публичным страницам.
                 */}
                <BootPreloader />
                <Providers>{children}</Providers>

                {/*
                 * Страховочный гейт: гасит прелоадер, только если его не взял
                 * на себя <App>. Инициализация здесь есть не везде — лишь в
                 * (auth), (integrations)/install, (product)/bitrix и (protected);
                 * там прелоадер держится до готовности данных, а публичный сайт
                 * гасит его сразу после гидратации.
                 */}
                <BootPreloaderGate fallback />


                {/* noscript — СТРОГО здесь */}
                {/* {YANDEX_ID && (
                    <noscript>
                        <div>
                            <img
                                src={`https://mc.yandex.ru/watch/${YANDEX_ID}`}
                                style={{ position: 'absolute', left: '-9999px' }}
                                alt=""
                            />
                        </div>
                    </noscript>
                )} */}
            </body>
        </html>
    );
}
