'use client'

import React from 'react';
import { OrkReportDealsByCompaniesDto } from "@workspace/nest-api";
import LineChart from './linechart';

interface ImplementationLineChartsProps {
    companies: OrkReportDealsByCompaniesDto[];
}

export const ImplementationLineCharts: React.FC<ImplementationLineChartsProps> = ({ companies }) => {
    if (!companies || companies.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">Нет данных для анализа</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-6">
                {/* График средней суммы сделок */}
                <LineChart
                    companies={companies}
                    chartType="avgSum"
                />

                {/* График индексации */}
                <LineChart
                    companies={companies}
                    chartType="index"
                />

                {/* График реализации */}
                <LineChart
                    companies={companies}
                    chartType="realization"
                />

                {/* Комбинированный график */}
                <LineChart
                    companies={companies}
                    chartType="combined"
                />
            </div>
        </div>
    );
};
