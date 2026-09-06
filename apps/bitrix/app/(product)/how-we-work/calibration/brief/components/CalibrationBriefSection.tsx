import React from 'react';
import { HowDocumentSection } from '../../../constants/types';
import { HowBlockList } from '../../../components/blocks/HowBlockList';

interface CalibrationBriefSectionProps {
    section: HowDocumentSection;
}

/** Раздел брифа: заголовок и блоки; при печати не рвётся посередине. */
export const CalibrationBriefSection: React.FC<
    CalibrationBriefSectionProps
> = ({ section }) => (
    <section
        className={
            section.pageBreakBefore
                ? 'brief-section brief-section--page-break'
                : 'brief-section'
        }
    >
        <h2 className="mb-4 text-xl font-bold text-foreground sm:text-2xl">
            {section.title}
        </h2>
        <HowBlockList blocks={section.blocks} />
    </section>
);
