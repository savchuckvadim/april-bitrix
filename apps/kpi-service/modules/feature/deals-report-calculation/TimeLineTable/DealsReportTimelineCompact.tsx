import React, { useCallback, useMemo, useState, useTransition } from 'react';
import { OrkReportDealsByCompaniesDto } from '@workspace/nest-api';
import {
    buildCompanyTimeline,
    calculateCrossYearIndexGrowth,
    getMinDateFromDeals,
    getYearsInPeriod,
    TimelineCompanyRow,
} from './lib/utils/timeline.utils';
import { PeriodFilter, TimelineMode } from './model/types';
import { PeriodFilterComponent } from './components/PeriodFilter';
import { TimelineModeSelector } from './components/TimelineModeSelector';
import { TimelineTable } from './features/TimelineTable';
import { ImplementationAnalytics } from './components/ImplementationAnalytics';
import { useDepartment } from '@/modules/entities/departament';
import { TimeLineTotal } from '../TimeLineTotal';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import { ExcelExportButton } from '@/modules/feature/excel-export';

interface DealsReportTimelineCompactProps {
    companies: OrkReportDealsByCompaniesDto[];
}

export const DealsReportTimelineCompact: React.FC<DealsReportTimelineCompactProps> = ({
    companies
}) => {
    // Дефолт — текущий год (раньше был захардкожен 2025).
    const currentYear = new Date().getFullYear();
    const [periodFilter, setPeriodFilter] = useState<PeriodFilter>({
        startDate: new Date(currentYear, 0, 1).toISOString(),
        endDate: new Date(currentYear, 11, 31).toISOString(),
        clientStatus: 'all',
        indexStatus: 'all',
        assignedUsers: []
    });
    const [timelineMode, setTimelineMode] = useState<TimelineMode>('detailed');
    const [expandedCompanies, setExpandedCompanies] = useState<Set<number>>(new Set());
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [showTotal, setShowTotal] = useState(false);
    // Смена фильтра = тяжёлый пересчёт: startTransition оставляет UI
    // отзывчивым, isPending приглушает контент на время пересчёта.
    const [isPending, startTransition] = useTransition();
    const { department } = useDepartment()
    const allUsers = department.items || []

    // Границы пикера лет: минимальный год из данных … текущий год + 1.
    const minYear = useMemo(
        () => getMinDateFromDeals(companies).getFullYear(),
        [companies],
    );
    const maxYear = currentYear + 1;

    // Получаем доступных пользователей (Map вместо find в двойном цикле)
    const availableUsers = useMemo(() => {
        const usersById = new Map(
            allUsers
                .filter(user => user?.ID !== undefined)
                .map(user => [String(user.ID), user]),
        );
        const userMap = new Map<string, string>();

        companies.forEach(company => {
            company.deals.forEach(deal => {
                if (deal.assignedById && !userMap.has(deal.assignedById)) {
                    const user = usersById.get(String(deal.assignedById));
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

    const handleFilterChange = useCallback((filter: Partial<PeriodFilter>) => {
        startTransition(() => {
            setPeriodFilter(prev => ({ ...prev, ...filter }));
        });
    }, []);

    const handleModeChange = (mode: TimelineMode) => {
        setTimelineMode(mode);
    };

    const handleToggleCompany = useCallback((companyId: number) => {
        setExpandedCompanies(prev => {
            const newSet = new Set(prev);
            if (newSet.has(companyId)) {
                newSet.delete(companyId);
            } else {
                newSet.add(companyId);
            }
            return newSet;
        });
    }, []);

    /**
     * ЕДИНЫЙ расчёт: фильтрация + метрики каждой компании считаются один
     * раз на смену данных/фильтра (buildCompanyTimeline — платежи одной
     * сделки не пересчитываются повторно). Фильтр индексации переиспользует
     * те же stats, а не считает их заново.
     */
    const companyRows = useMemo<TimelineCompanyRow[]>(() => {
        const startDate = new Date(periodFilter.startDate);
        const endDate = new Date(periodFilter.endDate);
        const multipleYears = getYearsInPeriod(startDate, endDate).length > 1;

        const rows: TimelineCompanyRow[] = [];
        for (const companyData of companies) {
            const { company } = companyData;

            // Фильтр по пользователям — скрываем компании без сделок выбранных
            if (periodFilter.assignedUsers.length > 0) {
                const hasDealWithSelectedUser = companyData.deals.some(deal =>
                    deal.assignedById && periodFilter.assignedUsers.includes(deal.assignedById)
                );
                if (!hasDealWithSelectedUser) continue;
            }

            // Фильтр по статусу клиента
            if (periodFilter.clientStatus === 'active' && !company.isActiveClient) continue;
            if (periodFilter.clientStatus === 'inactive' && company.isActiveClient) continue;

            const timeline = buildCompanyTimeline(
                companyData,
                startDate,
                endDate,
                periodFilter.assignedUsers,
            );

            // Фильтр по индексации — на УЖЕ рассчитанных stats
            if (periodFilter.indexStatus !== 'all') {
                const { indexGrowth } = timeline.stats;
                if (periodFilter.indexStatus === 'growing' && indexGrowth <= 0) continue;
                if (periodFilter.indexStatus === 'declining' && indexGrowth >= 0) continue;
                if (periodFilter.indexStatus === 'stable' && Math.abs(indexGrowth) > 5) continue;
            }

            rows.push({
                companyData,
                ...timeline,
                crossYearIndexes: multipleYears
                    ? calculateCrossYearIndexGrowth(timeline.yearlyMatrix)
                    : [],
            });
        }
        return rows;
    }, [companies, periodFilter]);

    // Полный отфильтрованный набор — для итогов и Excel (НЕ зависит от
    // виртуализации таблицы).
    const filteredCompanies = useMemo(
        () => companyRows.map(row => row.companyData),
        [companyRows],
    );
    const filteredCompaniesCount = filteredCompanies.length;

    const handleExportExcel = async () => {
        const { buildFinancialWorkbook } = await import(
            '@/modules/feature/excel-export/builders/financial.builder'
        );
        await buildFinancialWorkbook({
            filteredCompanies,
            periodFilter,
        });
    };

    if (companies.length === 0) {
        return (
            <div className="p-8 text-center text-gray-500">
                Нет данных для отображения
            </div>
        );
    }

    return (
        <div className="container mx-auto space-y-4">
            {/* Фильтры */}
            <div className="flex flex-col gap-4 items-center justify-between">

                <div className="flex items-center gap-4 w-full justify-end">
                    <ExcelExportButton
                        onBuild={handleExportExcel}
                        label="Скачать Excel"
                    />
                    <TimelineModeSelector
                        mode={timelineMode}
                        onModeChange={handleModeChange}
                    />
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowTotal(!showTotal)}
                        className={cn(
                            "px-4 py-2 rounded-lg   transition-colors",
                            showTotal ?
                                "bg-primary text-background  hover:bg-primary/10 hover:text-primary"
                                : "bg-primary/10 text-primary hover:bg-primary hover:text-background"
                        )}
                    >
                        {showTotal ? 'Скрыть итоги' : 'Показать итоги'}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAnalytics(!showAnalytics)}
                        className={cn(
                            "px-4 py-2 rounded-lg   transition-colors",
                            showAnalytics ?
                                "bg-primary text-background  hover:bg-primary/10 hover:text-primary"
                                : "bg-primary/10 text-primary hover:bg-primary hover:text-background"
                        )}
                    >
                        {showAnalytics ? 'Скрыть аналитику' : 'Показать аналитику'}
                    </Button>
                </div>
                {!showAnalytics && !showTotal && <PeriodFilterComponent
                    filter={periodFilter}
                    onFilterChange={handleFilterChange}
                    availableUsers={availableUsers}
                    filteredCount={filteredCompaniesCount}
                    totalCount={companies.length}
                    minYear={minYear}
                    maxYear={maxYear}
                />}
            </div>

            {/* Пересчёт после смены фильтра — контент приглушается, UI жив */}
            <div className={cn(isPending && 'opacity-60 transition-opacity')}>
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
                {!showTotal && !showAnalytics && (
                    <TimelineTable
                        rows={companyRows}
                        periodFilter={periodFilter}
                        timelineMode={timelineMode}
                        expandedCompanies={expandedCompanies}
                        onToggleCompany={handleToggleCompany}
                    />
                )}
            </div>
        </div>
    );
};
