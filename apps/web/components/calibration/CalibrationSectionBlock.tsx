import React from 'react';
import type { CalibrationSection } from '@/lib/calibration/types';
import { CalibrationBlockList } from './CalibrationBlockList';

interface CalibrationSectionBlockProps {
    section: CalibrationSection;
    /** Дополнительное содержимое раздела (например, аккордеон вопросов) */
    children?: React.ReactNode;
}

/** Раздел страницы: якорь, заголовок и блоки контента */
export const CalibrationSectionBlock: React.FC<
    CalibrationSectionBlockProps
> = ({ section, children }) => (
    <section id={section.id} className="scroll-mt-8">
        <h2 className="mb-5 text-2xl font-bold text-foreground sm:text-3xl">
            {section.title}
        </h2>
        <CalibrationBlockList blocks={section.blocks} />
        {children}
    </section>
);
