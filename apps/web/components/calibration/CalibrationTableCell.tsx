import React from 'react';
import { CalibrationRichText } from './CalibrationRichText';

interface CalibrationTableCellProps {
    /** Содержимое ячейки; пустая строка — поле под заполнение */
    value: string;
}

/**
 * Содержимое ячейки таблицы. Пустая ячейка — это поле брифа под заполнение,
 * поэтому она рисуется пунктирной строкой, а не пустым местом.
 */
export const CalibrationTableCell: React.FC<CalibrationTableCellProps> = ({
    value,
}) =>
    value ? (
        <CalibrationRichText text={value} />
    ) : (
        <span
            aria-hidden="true"
            className="block h-4 w-full border-b border-dashed border-border"
        />
    );
