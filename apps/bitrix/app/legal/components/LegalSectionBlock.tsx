import React from 'react';
import { LegalSection } from './types';
import { LegalParagraph } from './LegalParagraph';

interface LegalSectionBlockProps {
    section: LegalSection;
}

export const LegalSectionBlock: React.FC<LegalSectionBlockProps> = ({
    section,
}) => (
    <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-3">
            {section.title}
        </h2>
        <div className="space-y-3">
            {section.paragraphs.map((paragraph, index) => (
                <LegalParagraph key={index} text={paragraph} />
            ))}
        </div>
    </section>
);
