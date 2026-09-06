import React from 'react';
import { CalibrationRichText } from './CalibrationRichText';

interface CalibrationParagraphProps {
    text: string;
}

/** Обычный абзац раздела */
export const CalibrationParagraph: React.FC<CalibrationParagraphProps> = ({
    text,
}) => (
    <p className="text-foreground/90 leading-relaxed">
        <CalibrationRichText text={text} />
    </p>
);
