import type { ReactNode } from 'react';
import { LandingFooter } from './components/LandingFooter';
import { LandingHeader } from './components/LandingHeader';

/**
 * Layout продающего раздела /platform.
 *
 * Отдельная группа маршрутов, а не (site): у сайта шапка с якорями /home,
 * а здесь навигация по сервисам. Так существующие страницы сайта не
 * меняются вовсе.
 */
export default function LandingLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <LandingHeader />
            <main className="flex-grow">{children}</main>
            <LandingFooter />
        </div>
    );
}
