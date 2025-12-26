import { Geist, Geist_Mono } from 'next/font/google';
import '@workspace/ui/globals.css';
import '@workspace/theme/themes.css';
import { App } from '@/modules/app';
// import { Providers } from '@/components/providers';
// import LoadingScreen from '@/modules/shared/components/LoadingScreen/ui/LoadingScreen';



const fontSans = Geist({
    subsets: ['latin'],
    variable: '--font-sans',
});

const fontMono = Geist_Mono({
    subsets: ['latin'],
    variable: '--font-mono',
});

export default function InstallLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    console.log('InstallLayout');
    return (
        <html
            className="scrollbar-hide"
            lang="en"
            suppressHydrationWarning
        >

            <body
                className={`${fontSans.variable} ${fontMono.variable} scrollbar-hide  font-sans antialiased `}
            >

                <App isInstall={true} >
                    {children}
                </App>


            </body>
        </html>
    );
}
