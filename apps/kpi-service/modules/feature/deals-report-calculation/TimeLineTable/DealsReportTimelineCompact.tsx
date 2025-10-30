import React, { useMemo, useState } from 'react';
import { OrkReportDealsByCompaniesDto } from '@workspace/nest-api';
import { getMinDateFromDeals, calculateCompanyStats } from './lib/utils/timeline.utils';
import { PeriodFilter, TimelineMode } from './model/types';
import { PeriodFilterComponent } from './components/PeriodFilter';
import { TimelineModeSelector } from './components/TimelineModeSelector';
import { TimelineTable } from './features/TimelineTable';
import { ImplementationAnalytics } from './components/ImplementationAnalytics';
import { useDepartment } from '@/modules/entities/departament';
import { TimeLineTotal } from '../TimeLineTotal';

interface DealsReportTimelineCompactProps {
    companies: OrkReportDealsByCompaniesDto[];
}

export const DealsReportTimelineCompact: React.FC<DealsReportTimelineCompactProps> = ({
    companies
}) => {
    const [periodFilter, setPeriodFilter] = useState<PeriodFilter>({
        startDate: new Date(2025, 0, 1).toISOString(),
        endDate: new Date(2025, 11, 31).toISOString(),
        clientStatus: 'all',
        indexStatus: 'all',
        assignedUsers: []
    });
    const [timelineMode, setTimelineMode] = useState<TimelineMode>('detailed');
    const [expandedCompanies, setExpandedCompanies] = useState<Set<number>>(new Set());
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [showTotal, setShowTotal] = useState(false);
    const { department } = useDepartment()
    const allUsers = department.items || []
    // Получаем доступные годы для фильтра
    const availableYears = useMemo(() => {
        if (companies.length === 0) return [new Date().getFullYear()];

        const minDate = getMinDateFromDeals(companies);
        const currentYear = new Date().getFullYear();
        const minYear = minDate.getFullYear();

        const years = [];
        for (let year = minYear; year <= currentYear + 2; year++) {
            years.push(year);
        }
        return years;
    }, [companies]);

    // Получаем доступных пользователей
    const availableUsers = useMemo(() => {
        const userMap = new Map<string, string>();

        companies.forEach(company => {
            company.deals.forEach(deal => {
                if (deal.assignedById && !userMap.has(deal.assignedById)) {
                    const user = allUsers.find(user => user?.ID?.toString() === deal.assignedById?.toString());
                    const parts = [
                        user?.LAST_NAME,
                        user?.NAME,
                        user?.SECOND_NAME
                    ].filter(Boolean);
                    const userName = parts.length > 0
                        ? parts.join(' ').trim()
                        : `Пользователь ${deal.assignedById}`;
                    userMap.set(deal.assignedById, userName);
                }
            });
        });

        return Array.from(userMap.entries()).map(([id, name]) => ({ id, name }));
    }, [companies, allUsers]);

    const handleFilterChange = (filter: Partial<PeriodFilter>) => {
        setPeriodFilter(prev => ({ ...prev, ...filter }));
    };

    const handleModeChange = (mode: TimelineMode) => {
        setTimelineMode(mode);
    };

    const handleToggleCompany = (companyId: number) => {
        setExpandedCompanies(prev => {
            const newSet = new Set(prev);
            if (newSet.has(companyId)) {
                newSet.delete(companyId);
            } else {
                newSet.add(companyId);
            }
            return newSet;
        });
    };

    // Фильтрация компаний (используем ту же логику, что и в TimelineTable)
    const filteredCompanies = useMemo(() => {
        return companies.filter(companyData => {
            const { company } = companyData;

            // Фильтр по пользователям - скрываем компании без сделок выбранных пользователей
            if (periodFilter.assignedUsers.length > 0) {
                const hasDealWithSelectedUser = companyData.deals.some(deal =>
                    deal.assignedById && periodFilter.assignedUsers.includes(deal.assignedById)
                );
                if (!hasDealWithSelectedUser) return false;
            }

            // Фильтр по статусу клиента
            if (periodFilter.clientStatus === 'active' && !company.isActiveClient) return false;
            if (periodFilter.clientStatus === 'inactive' && company.isActiveClient) return false;

            // Фильтр по индексации
            const stats = calculateCompanyStats(companyData, new Date(periodFilter.startDate), new Date(periodFilter.endDate), periodFilter.assignedUsers);
            if (periodFilter.indexStatus === 'growing' && stats.indexGrowth <= 0) return false;
            if (periodFilter.indexStatus === 'declining' && stats.indexGrowth >= 0) return false;
            if (periodFilter.indexStatus === 'stable' && Math.abs(stats.indexGrowth) > 5) return false;

            return true;
        });
    }, [companies, periodFilter]);

    const filteredCompaniesCount = filteredCompanies.length;

    if (companies.length === 0) {
        return (
            <div className="p-8 text-center text-gray-500">
                Нет данных для отображения
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Фильтры */}
            <div className="flex flex-col gap-4 items-center justify-between">

                <div className="flex items-center gap-4 w-full justify-end">
                    <TimelineModeSelector
                        mode={timelineMode}
                        onModeChange={handleModeChange}
                    />
                    <button
                        onClick={() => setShowTotal(!showTotal)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                        {showTotal ? 'Скрыть итоги' : 'Показать итоги'}
                    </button>
                    <button
                        onClick={() => setShowAnalytics(!showAnalytics)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        {showAnalytics ? 'Скрыть аналитику' : 'Показать аналитику'}
                    </button>
                </div>
                {!showAnalytics && !showTotal && <PeriodFilterComponent
                    filter={periodFilter}
                    onFilterChange={handleFilterChange}
                    availableYears={availableYears}
                    availableUsers={availableUsers}
                    filteredCount={filteredCompaniesCount}
                    totalCount={companies.length}
                />}
            </div>

            {/* Итоговая статистика */}
            {showTotal && (
                <div className="mt-4">
                    <TimeLineTotal
                        filteredCompanies={filteredCompanies}
                        periodFilter={periodFilter}
                    />
                </div>
            )}

            {/* Аналитика */}
            {showAnalytics && (
                <div className="mt-8">
                    <h3 className="text-xl font-semibold mb-4">Аналитика реализации и индексации</h3>
                    <ImplementationAnalytics
                        companies={companies}
                        startDate={periodFilter.startDate}
                        endDate={periodFilter.endDate}
                        assignedUsers={periodFilter.assignedUsers}
                    />
                </div>
            )}

            {/* Таблица таймлайна */}
            {!showTotal && !showAnalytics && (<TimelineTable
                companies={companies}
                periodFilter={periodFilter}
                timelineMode={timelineMode}
                expandedCompanies={expandedCompanies}
                onToggleCompany={handleToggleCompany}
            />
            )}


        </div>
    );
};
