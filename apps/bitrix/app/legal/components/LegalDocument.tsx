import React from 'react';
import { LegalDocumentData } from './types';
import { LegalDocumentHeader } from './LegalDocumentHeader';
import { LegalParagraph } from './LegalParagraph';
import { LegalSectionBlock } from './LegalSectionBlock';

interface LegalDocumentProps {
    document: LegalDocumentData;
}

export const LegalDocument: React.FC<LegalDocumentProps> = ({ document }) => (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
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
