import React from 'react';
import { parseCalibrationRichText } from '@/lib/calibration/rich-text.util';

interface CalibrationRichTextProps {
    /** Строка с разметкой `**жирный**` и `*курсив*` */
    text: string;
}

/**
 * Рендерит строку контента с выделениями. Без markdown-библиотек: в тексте
 * встречаются ровно два вида разметки, разбирает их `rich-text.util`.
 */
export const CalibrationRichText: React.FC<CalibrationRichTextProps> = ({
    text,
}) => (
    <>
        {parseCalibrationRichText(text).map((chunk, index) => {
            if (chunk.kind === 'strong') {
                return (
                    <strong key={index} className="font-semibold text-foreground">
                        {chunk.value}
                    </strong>
                );
            }

            if (chunk.kind === 'em') {
                return (
                    <em key={index} className="italic text-muted-foreground">
                        {chunk.value}
                    </em>
                );
            }

            return (
                <React.Fragment key={index}>{chunk.value}</React.Fragment>
            );
        })}
    </>
);
