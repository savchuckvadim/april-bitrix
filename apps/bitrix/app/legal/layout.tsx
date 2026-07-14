import React from 'react';
import { Header } from '../(app)/home/components/Header';
import { Footer } from '../(app)/home/components/Footer';

export default function LegalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
        </div>
    );
}
