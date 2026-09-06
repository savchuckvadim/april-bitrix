import React from 'react';
import { CalibrationRichText } from './CalibrationRichText';

interface CalibrationListProps {
    items: string[];
}

/** Маркированный список раздела */
export const CalibrationList: React.FC<CalibrationListProps> = ({ items }) => (
    <ul className="space-y-3">
        {items.map((item, index) => (
            <li
                key={index}
                className="relative pl-6 text-foreground/90 leading-relaxed before:absolute before:left-1 before:top-[0.7em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary"
            >
                <CalibrationRichText text={item} />
            </li>
        ))}
    </ul>
);
