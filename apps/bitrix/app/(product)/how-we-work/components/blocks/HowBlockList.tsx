import React from 'react';
import { HowContentBlock } from '../../constants/types';
import { HowBlockRenderer } from './HowBlockRenderer';

interface HowBlockListProps {
    blocks: HowContentBlock[];
}

/** Последовательность контентных блоков с единым вертикальным ритмом. */
export const HowBlockList: React.FC<HowBlockListProps> = ({ blocks }) => (
    <div className="space-y-6">
        {blocks.map((block, index) => (
            <HowBlockRenderer key={index} block={block} />
        ))}
    </div>
);
