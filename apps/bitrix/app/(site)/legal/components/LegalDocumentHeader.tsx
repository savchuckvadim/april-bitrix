import React from 'react';

interface LegalDocumentHeaderProps {
    title: string;
    subtitle: string;
    revision: string;
}

export const LegalDocumentHeader: React.FC<LegalDocumentHeaderProps> = ({
    title,
    subtitle,
    revision,
}) => (
    <header className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            {title}
        </h1>
        <p className="text-lg text-muted-foreground">{subtitle}</p>
        <p className="text-sm text-muted-foreground mt-2">{revision}</p>
    </header>
);
