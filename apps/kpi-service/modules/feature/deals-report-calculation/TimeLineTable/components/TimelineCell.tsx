import React from 'react';
import { YearlyData, TimelineMode } from '../model/types';
import { getDealColor } from '../lib/utils/timeline.utils';
import { formatNumber } from '../lib/utils/format.utils';

interface TimelineCellProps {
    yearlyData: YearlyData[];
    monthIndex: number;
    mode: TimelineMode;
    years: number[];
}

/**
 * Ячейка месяца: полоса на каждый год диапазона (detailed) либо одна
 * полоса среднего/итога. Самый массовый компонент таблицы
 * (12 ячеек × строки × годы) — React.memo обязателен: пропсы стабильны
 * (yearlyMatrix из useMemo), ре-рендер нужен только при смене фильтра.
 */
export const TimelineCell: React.FC<TimelineCellProps> = React.memo(
    ({ yearlyData, monthIndex, mode, years }) => {
        if (mode === 'detailed') {
            return (
                <div className="flex flex-col gap-0.5">
                    {yearlyData.map(yearData => {
                        const amount = yearData.monthlyTotals[monthIndex] || 0;
                        const prevAmount =
                            monthIndex > 0
                                ? yearData.monthlyTotals[monthIndex - 1] || 0
                                : undefined;
                        const yearColor = getDealColor(amount, prevAmount);
                        const coefficient = years.length > 1 ? 30 : 16;
                        const dynamicHeight = Math.max(
                            8,
                            Math.floor(coefficient / years.length),
                        );

                        return (
                            <div
                                key={yearData.year}
                                className={`${yearColor} rounded text-xs flex items-center justify-center font-medium text-white`}
                                style={{ height: `${dynamicHeight}px` }}
                            >
                                {amount > 0
                                    ? formatNumber(Math.round(amount))
                                    : ''}
                            </div>
                        );
                    })}
                </div>
            );
        }

        if (mode === 'average') {
            const totalAmount = yearlyData.reduce(
                (sum, yearData) =>
                    sum + (yearData.monthlyTotals[monthIndex] || 0),
                0,
            );
            const averageAmount =
                years.length > 0 ? totalAmount / years.length : 0;

            return (
                <div className="h-8 bg-blue-200 rounded text-xs flex items-center justify-center font-medium">
                    {averageAmount > 0
                        ? `${formatNumber(Math.round(averageAmount))} ₽`
                        : ''}
                </div>
            );
        }

        if (mode === 'total') {
            const totalAmount = yearlyData.reduce(
                (sum, yearData) =>
                    sum + (yearData.monthlyTotals[monthIndex] || 0),
                0,
            );

            return (
                <div className="h-8 bg-green-200 rounded text-xs flex items-center justify-center font-medium">
                    {totalAmount > 0
                        ? `${formatNumber(Math.round(totalAmount))} ₽`
                        : ''}
                </div>
            );
        }

        return null;
    },
);

TimelineCell.displayName = 'TimelineCell';
