import { Geist, Geist_Mono } from 'next/font/google';

import '@workspace/ui/globals.css';
import '@/style/print.css';
import '@/style/fonts.css';
import { Providers } from '@/modules/app/providers';
import { App } from '@/modules/app/ui/App';
import { Header } from '@/modules/widgets';
import { SnapshotNavWatcher } from '@/modules/processes/konstructor';

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
                <Providers>
                    <App>
                        <SnapshotNavWatcher />
                        <Header />
                        {children}
                    </App>
                </Providers>
            </body>
        </html>
    );
}
