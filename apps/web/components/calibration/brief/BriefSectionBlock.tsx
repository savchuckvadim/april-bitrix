import React from 'react';
import type { CalibrationBriefSection } from '@/lib/calibration/types';
import { CalibrationBlockList } from '../CalibrationBlockList';

interface BriefSectionBlockProps {
    section: CalibrationBriefSection;
}

/** Раздел брифа: заголовок и блоки; при печати не рвётся посередине */
export const BriefSectionBlock: React.FC<BriefSectionBlockProps> = ({
    section,
}) => (
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
        <CalibrationBlockList blocks={section.blocks} />
    </section>
);
