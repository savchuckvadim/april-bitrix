'use client';

import { Inter } from 'next/font/google';
import '@workspace/ui/globals.css';
// import "@workspace/theme/themes.css"
import { Providers } from '@/components/providers';
import { LoadingScreen } from '@/modules/general';
import Header from '@/modules/widgetes/Header/Header';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ru" suppressHydrationWarning className="scrollbar-hide">
            <body className={`${inter.className} `}>
                <LoadingScreen />
                <Providers>
                    <Header />
                    <main className="min-h-screen bg-background ">
                        {children}
                    </main>
                </Providers>
            </body>
        </html>
    );
}
