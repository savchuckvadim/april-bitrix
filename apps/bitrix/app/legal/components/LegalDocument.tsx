import React from 'react';
import { LegalDocumentData } from './types';
import { LegalDocumentHeader } from './LegalDocumentHeader';
import { LegalParagraph } from './LegalParagraph';
import { LegalSectionBlock } from './LegalSectionBlock';
import { LegalPrintStyles } from './LegalPrintStyles';
import { DownloadPdfButton } from './DownloadPdfButton';

interface LegalDocumentProps {
    document: LegalDocumentData;
    /**
     * Заранее сгенерированный PDF документа (public/legal/*.pdf).
     * Не задан — кнопка скачивания не показывается.
     */
    pdf?: {
        href: string;
        fileName: string;
    };
}

export const LegalDocument: React.FC<LegalDocumentProps> = ({
    document,
    pdf,
}) => (
    <article className="legal-document max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <LegalPrintStyles />

        {pdf && (
            <div className="no-print flex justify-end mb-6">
                <DownloadPdfButton
                    href={pdf.href}
                    fileName={pdf.fileName}
                />
            </div>
        )}

        <LegalDocumentHeader
            title={document.title}
            subtitle={document.subtitle}
            revision={document.revision}
        />

        <div className="space-y-4 mb-10">
            {document.intro.map((paragraph, index) => (
                <LegalParagraph key={index} text={paragraph} />
            ))}
        </div>

        {document.sections.map((section, index) => (
            <LegalSectionBlock key={index} section={section} />
        ))}
    </article>
);
