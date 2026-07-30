import React from 'react';
import { Header } from './home/components/Header';
import { Footer } from './home/components/Footer';

/**
 * Layout публичного сайта: общий Header/Footer лендинга.
 * Все маркетинговые страницы (home, how-we-work, leads-process,
 * legal, offer, support) живут здесь. CRM-группы ((product),
 * (integrations), (protected)) этот хедер не получают.
 */
export default function SiteLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col bg-background scrollbar-hide">
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
        </div>
    );
}
