import React from 'react';
import { CalibrationRichText } from './CalibrationRichText';

interface CalibrationNoteProps {
    text: string;
}

/** Выделенная врезка: ключевая мысль раздела */
export const CalibrationNote: React.FC<CalibrationNoteProps> = ({ text }) => (
    <aside className="rounded-lg border border-border border-l-4 border-l-primary bg-muted/50 px-4 py-4 sm:px-5">
        <p className="text-foreground/90 leading-relaxed">
            <CalibrationRichText text={text} />
        </p>
    </aside>
);
