'use client';
import { Inter } from 'next/font/google';
import '@workspace/ui/globals.css';
// import "@workspace/theme/themes.css"
import { Providers } from '@/components/providers';
import { LoadingScreen } from '@/modules/general';
import App from '@/modules/app/ui/App';
import { ReportProvider } from '@/modules/entities/report/ui/ReportProvider';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ru" suppressHydrationWarning>
            <body className={inter.className}>
                <LoadingScreen />
                <Providers>
                    <main className="min-h-screen bg-background">
                        <App>
                            <ReportProvider>
                                {children}
                            </ReportProvider>
                        </App>
                    </main>
                </Providers>
            </body>
        </html>
    );
}
