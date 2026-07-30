import React from 'react';
import { LeadsSection } from '../constants/types';
import { LeadsSectionBlockRenderer } from './LeadsSectionBlockRenderer';

interface LeadsSectionViewProps {
    section: LeadsSection;
}

/** Секция страницы: якорь для sidebar, шапка и блоки. */
export const LeadsSectionView: React.FC<LeadsSectionViewProps> = ({
    section,
}) => (
    <section id={section.id} className="scroll-mt-20 py-8 first:pt-0">
        {section.eyebrow && (
            <p className="mb-1.5 text-xs font-bold uppercase tracking-widest text-primary">
                {section.eyebrow}
            </p>
        )}
        <h2 className="mb-5 text-2xl font-bold tracking-tight text-foreground">
            {section.title}
        </h2>
        <div className="space-y-5">
            {section.blocks.map((block, index) => (
                <LeadsSectionBlockRenderer key={index} block={block} />
            ))}
        </div>
    </section>
);
