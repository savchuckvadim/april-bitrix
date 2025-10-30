import React from 'react';
import { YearlyData, TimelineMode } from '../model/types';
import { getDealColor } from '../lib/utils/timeline.utils';

interface TimelineCellProps {
    yearlyData: YearlyData[];
    monthIndex: number;
    mode: TimelineMode;
    years: number[];
}

export const TimelineCell: React.FC<TimelineCellProps> = ({
    yearlyData,
    monthIndex,
    mode,
    years
}) => {
    if (mode === 'detailed') {
        // Для детального режима показываем матрицу по годам
        const totalForMonth = yearlyData.reduce((sum, yearData) => {
            return sum + (yearData.monthlyTotals[monthIndex] || 0);
        }, 0);

        return (
            <div className="flex flex-col gap-0.5">
                {/* Суммарная строка (закомментирована по просьбе пользователя) */}
                {/* <div className="h-3 bg-gray-200 rounded text-xs flex items-center justify-center font-medium">
                    {totalForMonth > 0 ? `${Math.round(totalForMonth).toLocaleString()} ₽` : ''}
                </div> */}

                {/* Строки по годам */}
                {yearlyData.map((yearData, yearIndex) => {
                    const amount = yearData.monthlyTotals[monthIndex] || 0;
                    const prevAmount = monthIndex > 0 ? yearData.monthlyTotals[monthIndex - 1] || 0 : undefined;
                    const yearColor = getDealColor(amount, prevAmount);
                    const coefficient = years.length > 1 ? 30 : 16;
                    const dynamicHeight = Math.max(8, Math.floor(coefficient / years.length)); // Динамическая высота

                    return (
                        <div
                            key={yearData.year}
                            className={`${yearColor} rounded text-xs flex items-center justify-center font-medium text-white`}
                            style={{ height: `${dynamicHeight}px` }}
                        >
                            {amount > 0 ? `${Math.round(amount).toLocaleString()}` : ''}
                        </div>
                    );
                })}
            </div>
        );
    }

    if (mode === 'average') {
        // Для режима средних показателей
        const totalAmount = yearlyData.reduce((sum, yearData) => {
            return sum + (yearData.monthlyTotals[monthIndex] || 0);
        }, 0);
        const averageAmount = years.length > 0 ? totalAmount / years.length : 0;

        return (
            <div className="h-8 bg-blue-200 rounded text-xs flex items-center justify-center font-medium">
                {averageAmount > 0 ? `${Math.round(averageAmount).toLocaleString()} ₽` : ''}
            </div>
        );
    }

    if (mode === 'total') {
        // Для режима итоговых показателей
        const totalAmount = yearlyData.reduce((sum, yearData) => {
            return sum + (yearData.monthlyTotals[monthIndex] || 0);
        }, 0);

        return (
            <div className="h-8 bg-green-200 rounded text-xs flex items-center justify-center font-medium">
                {totalAmount > 0 ? `${Math.round(totalAmount).toLocaleString()} ₽` : ''}
            </div>
        );
    }

    return null;
};
