import React from 'react';

interface CalibrationSubheadingProps {
    text: string;
}

/** Подзаголовок внутри раздела (блоки «Что мы просим», пункты брифа) */
export const CalibrationSubheading: React.FC<CalibrationSubheadingProps> = ({
    text,
}) => (
    <h3 className="pt-2 text-lg font-semibold text-foreground sm:text-xl">
        {text}
    </h3>
);
