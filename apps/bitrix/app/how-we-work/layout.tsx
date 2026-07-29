import React from 'react';
import { Header } from '../(app)/home/components/Header';
import { Footer } from '../(app)/home/components/Footer';
import { HowSectionNav } from './components/HowSectionNav';

export default function HowWeWorkLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />
            <HowSectionNav />
            <main className="flex-grow">{children}</main>
            <Footer />
        </div>
    );
}
