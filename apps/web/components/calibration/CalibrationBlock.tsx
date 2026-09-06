import React from 'react';
import type { CalibrationBlock as CalibrationBlockData } from '@/lib/calibration/types';
import { CalibrationList } from './CalibrationList';
import { CalibrationNote } from './CalibrationNote';
import { CalibrationParagraph } from './CalibrationParagraph';
import { CalibrationSubheading } from './CalibrationSubheading';
import { CalibrationTable } from './CalibrationTable';

interface CalibrationBlockProps {
    block: CalibrationBlockData;
}

/** Рендерит один блок контента по его типу */
export const CalibrationBlock: React.FC<CalibrationBlockProps> = ({
    block,
}) => {
    switch (block.kind) {
        case 'paragraph':
            return <CalibrationParagraph text={block.text} />;
        case 'note':
            return <CalibrationNote text={block.text} />;
        case 'subheading':
            return <CalibrationSubheading text={block.text} />;
        case 'list':
            return <CalibrationList items={block.items} />;
        case 'table':
            return <CalibrationTable head={block.head} rows={block.rows} />;
    }
};
