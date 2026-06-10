import { Geist, Geist_Mono } from 'next/font/google';
import '@workspace/ui/globals.css';
import '@workspace/theme/themes.css';
import { Providers } from '@/providers/providers';
import { LoadingScreen } from '@/modules/shared/ui';

import { CrmShell } from '@/modules/widgets';

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
        <html
            className="scrollbar-hide h-full overflow-hidden"
            lang="en"
            suppressHydrationWarning
        >
            <body className={`${fontSans.variable} ${fontMono.variable} scrollbar-hide  h-screen font-sans antialiased m-0 p-0 overflow-y-auto`}>
                <LoadingScreen />
                <Providers>
                    <div className="flex h-full w-full overflow-hidden bg-card">
                        <CrmShell>
                            {children}
                        </CrmShell>
                    </div>
                </Providers>
            </body>
        </html>
    );
}
