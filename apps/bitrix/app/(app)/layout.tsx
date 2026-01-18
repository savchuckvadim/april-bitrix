import { Geist, Geist_Mono } from 'next/font/google';
import '@workspace/ui/globals.css';
import '@workspace/theme/themes.css';
import { App } from '@/modules/app';
// import { Providers } from '@/components/providers';
// import LoadingScreen from '@/modules/shared/components/LoadingScreen/ui/LoadingScreen';




export default function AppLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    console.log('InstallLayout');
    return (


        <App isInstall={false} >
            {children}
        </App>

    );
}
