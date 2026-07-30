import React from 'react';
import { HowSectionNav } from './components/HowSectionNav';

export default function HowWeWorkLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <HowSectionNav />
            {children}
        </>
    );
}
