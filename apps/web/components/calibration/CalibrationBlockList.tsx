import React from 'react';
import type { CalibrationBlock as CalibrationBlockData } from '@/lib/calibration/types';
import { CalibrationBlock } from './CalibrationBlock';

interface CalibrationBlockListProps {
    blocks: CalibrationBlockData[];
}

/** Последовательность блоков контента */
export const CalibrationBlockList: React.FC<CalibrationBlockListProps> = ({
    blocks,
}) => (
    <div className="space-y-5">
        {blocks.map((block, index) => (
            <CalibrationBlock key={index} block={block} />
        ))}
    </div>
);
