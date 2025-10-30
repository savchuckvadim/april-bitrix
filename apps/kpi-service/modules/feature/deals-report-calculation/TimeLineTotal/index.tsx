import React from 'react';
import { OrkReportDealsByCompaniesDto } from '@workspace/nest-api';
import { PeriodFilter } from '../TimeLineTable/model/types';
import { TotalTimelineTable } from './components/TotalTimelineTable';
import { TotalCharts } from './components/TotalCharts';
import { Card } from '@workspace/ui/components/card';

interface TimeLineTotalProps {
    filteredCompanies: OrkReportDealsByCompaniesDto[];
    periodFilter: PeriodFilter;
}

export const TimeLineTotal: React.FC<TimeLineTotalProps> = ({
    filteredCompanies,
    periodFilter
}) => {
    if (filteredCompanies.length === 0) {
        return (
            <Card className="p-8 text-center text-gray-500">
                Нет данных для отображения
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Итоговая таблица */}
            <TotalTimelineTable
                companies={filteredCompanies}
                periodFilter={periodFilter}
            />

            {/* Графики и статистика */}
            <TotalCharts
                companies={filteredCompanies}
                periodFilter={periodFilter}
            />
        </div>
    );
};

