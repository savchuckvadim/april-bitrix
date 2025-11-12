'use client'

import { useUserReport } from "../../hooks/user-report.hook";
import { useDepartment } from "@/modules/entities/departament";
import { IUserReportItem } from "../../type/user-report.type";

import React, { useEffect, useState, useMemo } from "react";
import { parse } from 'date-fns';

import { Loader2, BarChart3, Table, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { useApp } from "@/modules/app";
import { UserReportHeader } from "./UserReportHeader";
import { UserReportStats } from "./UserReportStats";
import { UserReportEventTable } from "./UserReportEventTable";
import { UserReportFilters } from "./UserReportFilters";
import { UserReportChart } from "./UserReportChart";
import ReportHeader from "@/modules/entities/report/ui/ReportHeader/ReportHeader";
import Filter from "@/modules/entities/report/ui/Filter";
import { useReport } from "@/modules/entities/report";
import { ArrowBack } from "./ArrowBack";
import { Preloader } from "@/modules/shared";



const BATCH_DISPLAY_SIZE = 300; // сколько показывать за раз

export const UserReport = ({ userId }: { userId: number }) => {
    const { initialized } = useApp()
    const { getUserReport, report, isFetched } = useUserReport();
    const { department } = useDepartment();



    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const [visibleCount, setVisibleCount] = useState(BATCH_DISPLAY_SIZE);
    const [selectedFilters, setSelectedFilters] = useState<{
        action?: string;
        type?: string;
        initiative?: string;
        communication?: string;
        color?: string;
    }>({});
    const [groupByCompany, setGroupByCompany] = useState(false);
    const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');
    const [sortBy, setSortBy] = useState<'default' | 'plan_date_asc' | 'plan_date_desc'>('default');

    // загрузка при маунте
    useEffect(() => {
        if (initialized) {

            getUserReport(userId);
        }
    }, [userId, initialized]);

    // фильтрация элементов
    const filteredReport = useMemo(() => {
        let filtered = report.filter(item => {
            if (selectedFilters.action && item.sales_kpi_event_action?.value?.code !== selectedFilters.action) {
                return false;
            }
            if (selectedFilters.type && item.sales_kpi_event_type?.value?.code !== selectedFilters.type) {
                return false;
            }
            if (selectedFilters.color && item.company?.color !== selectedFilters.color) {
                return false;
            }
            return true;
        });

        // Сортировка
        if (sortBy === 'plan_date_asc' || sortBy === 'plan_date_desc') {
            filtered = [...filtered].sort((a, b) => {
                const dateA = a.sales_kpi_plan_date?.value?.value;
                const dateB = b.sales_kpi_plan_date?.value?.value;

                // Элементы без даты идут в конец
                if (!dateA && !dateB) return 0;
                if (!dateA) return 1;
                if (!dateB) return -1;

                try {
                    const parsedA = parse(dateA, "dd.MM.yyyy HH:mm:ss", new Date()).getTime();
                    const parsedB = parse(dateB, "dd.MM.yyyy HH:mm:ss", new Date()).getTime();

                    if (sortBy === 'plan_date_asc') {
                        return parsedA - parsedB;
                    } else {
                        return parsedB - parsedA;
                    }
                } catch {
                    // Если не удалось распарсить, оставляем на месте
                    return 0;
                }
            });
        }

        return filtered;
    }, [report, selectedFilters, sortBy]);

    // группировка по компаниям (если включена группировка)
    const groupedReport = useMemo(() => {
        if (!groupByCompany) return filteredReport;

        // Группируем ВСЕ элементы из стейта, а не только отфильтрованные
        const allGrouped = report.reduce((acc, item) => {
            const companyIdData = item.sales_kpi_crm_company?.value?.value;
            const companyId = companyIdData?.toString().replace(/\D/g, '') || 'unknown';
            const company = department.items.find(dep => dep?.ID?.toString() === companyId)?.NAME || companyId;

            if (!acc[company]) {
                acc[company] = [];
            }
            acc[company].push(item);
            return acc;
        }, {} as Record<string, IUserReportItem[]>);

        // Сортируем группы по названию компании
        const sortedGroups = Object.entries(allGrouped).sort(([a], [b]) => a.localeCompare(b));

        // Создаем плоский массив с метаданными для группировки
        const result: (IUserReportItem & {
            isFirstInGroup?: boolean;
            companyName?: string;
            groupSize?: number;
        })[] = [];

        sortedGroups.forEach(([companyName, items]) => {
            items.forEach((item, index) => {
                result.push({
                    ...item,
                    isFirstInGroup: index === 0,
                    companyName,
                    groupSize: items.length
                });
            });
        });

        return result;
    }, [report, groupByCompany, department.items]);

    // фильтрация уже сгруппированных элементов
    const filteredGroupedReport = useMemo(() => {
        if (!groupByCompany) return filteredReport;

        let filtered = groupedReport.filter(item => {
            if (selectedFilters.action && item.sales_kpi_event_action?.value?.code !== selectedFilters.action) {
                return false;
            }
            if (selectedFilters.type && item.sales_kpi_event_type?.value?.code !== selectedFilters.type) {
                return false;
            }
            if (selectedFilters.color && item.company?.color !== selectedFilters.color) {
                return false;
            }
            return true;
        }) as (IUserReportItem & {
            isFirstInGroup?: boolean;
            companyName?: string;
            groupSize?: number;
        })[];

        // Сортировка для сгруппированных элементов
        if (sortBy === 'plan_date_asc' || sortBy === 'plan_date_desc') {
            filtered = [...filtered].sort((a, b) => {
                const dateA = a.sales_kpi_plan_date?.value?.value;
                const dateB = b.sales_kpi_plan_date?.value?.value;

                // Элементы без даты идут в конец
                if (!dateA && !dateB) return 0;
                if (!dateA) return 1;
                if (!dateB) return -1;

                try {
                    const parsedA = parse(dateA, "dd.MM.yyyy HH:mm:ss", new Date()).getTime();
                    const parsedB = parse(dateB, "dd.MM.yyyy HH:mm:ss", new Date()).getTime();

                    if (sortBy === 'plan_date_asc') {
                        return parsedA - parsedB;
                    } else {
                        return parsedB - parsedA;
                    }
                } catch {
                    // Если не удалось распарсить, оставляем на месте
                    return 0;
                }
            });
        }

        // Пересчитываем isFirstInGroup для отфильтрованных элементов
        const result = filtered.map((item: IUserReportItem, index) => {
            const prevItem = index > 0 ? filtered[index - 1] : null;
            const prevCompany = prevItem?.sales_kpi_crm_company?.value?.value?.toString() || '';
            const currentCompany = item.sales_kpi_crm_company?.value?.value?.toString() || '';

            return {
                ...item,
                isFirstInGroup: prevCompany !== currentCompany
            };
        });

        return result;
    }, [groupedReport, selectedFilters, groupByCompany, sortBy]);

    // вычисление отображаемых элементов
    const visibleItems = useMemo(() => {
        const sourceData = groupByCompany ? filteredGroupedReport : filteredReport;
        return sourceData.slice(0, visibleCount);
    }, [filteredGroupedReport, filteredReport, visibleCount, groupByCompany]);

    const handleLoadMore = () => {
        const sourceData = groupByCompany ? filteredGroupedReport : filteredReport;
        setVisibleCount(prev => Math.min(prev + BATCH_DISPLAY_SIZE, sourceData.length));
    };

    const getUser = useMemo(() => {
        return department.items.find(item => item?.ID?.toString() === userId.toString());
    }, [department.items, userId]);

    if (!isFetched && !report.length) {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <div className="flex justify-center items-center py-20 text-gray-500">
                <div className="mr-3">
                    <Preloader />
                </div> <span> Загружаем отчёт...</span>
                </div>
            </div>
        );
    }


    return (
        <div className="mx-auto p-6 space-y-6 p-10">
            <div className="bg-background/50 backdrop-blur-sm fixed top-0 left-0 right-0 z-10 min-w-full">

                <div className="flex justify-between items-center h-15 p-5 w-full">
                    <ArrowBack />
                    <ReportHeader
                        isFilterOpen={isFilterOpen}
                        setIsFilterOpen={setIsFilterOpen}
                    />
                </div>
                <div className="px-15">
                    <Filter isOpen={isFilterOpen} />
                    {
                        isFilterOpen && <div className="h-screen w-screen "></div>
                    }
                </div>

            </div>
            <div>

            </div>
            <UserReportHeader
                userName={getUser?.NAME || `Пользователь #${userId}`}
                userId={userId}
                totalEvents={report.length}
                avatar={getUser?.PERSONAL_PHOTO || ''}
            />

            <UserReportStats report={filteredReport} />

            <UserReportFilters
                report={report}
                selectedFilters={selectedFilters}
                onFilterChange={setSelectedFilters}
                groupByCompany={groupByCompany}
                onGroupByCompanyChange={setGroupByCompany}
            />

            <div id="user-report">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-primary">
                        История событий
                        {filteredReport.length !== report.length && (
                            <span className="text-sm text-gray-500 ml-2">
                                ({filteredReport.length} из {report.length})
                            </span>
                        )}
                    </h2>
                    <div className="flex items-center gap-2">
                        {/* <Button
                            variant={sortBy === 'default' ? "outline" : sortBy === 'plan_date_asc' ? "default" : "default"}
                            size="sm"
                            onClick={() => {
                                if (sortBy === 'default') {
                                    setSortBy('plan_date_asc');
                                } else if (sortBy === 'plan_date_asc') {
                                    setSortBy('plan_date_desc');
                                } else {
                                    setSortBy('default');
                                }
                            }}
                            className="flex items-center gap-2"
                        >
                            {sortBy === 'default' && <ArrowUpDown className="w-4 h-4" />}
                            {sortBy === 'plan_date_asc' && <ArrowUp className="w-4 h-4" />}
                            {sortBy === 'plan_date_desc' && <ArrowDown className="w-4 h-4" />}
                            {sortBy === 'default' && 'Сортировка по дате'}
                            {sortBy === 'plan_date_asc' && 'По дате (↑)'}
                            {sortBy === 'plan_date_desc' && 'По дате (↓)'}
                        </Button> */}
                        <Button
                            variant={viewMode === 'table' ? "default" : "outline"}
                            size="sm"
                            onClick={() => setViewMode('table')}
                            className="flex items-center gap-2"
                        >
                            <Table className="w-4 h-4" />
                            Таблица
                        </Button>
                        <Button
                            variant={viewMode === 'chart' ? "default" : "outline"}
                            size="sm"
                            onClick={() => setViewMode('chart')}
                            className="flex items-center gap-2"
                        >
                            <BarChart3 className="w-4 h-4" />
                            График
                        </Button>
                    </div>
                </div>

                {viewMode === 'table' ? (
                    <UserReportEventTable
                        visibleItems={visibleItems}
                        allItems={groupByCompany ? filteredGroupedReport : filteredReport}
                        visibleCount={visibleCount}
                        onLoadMore={handleLoadMore}
                        groupByCompany={groupByCompany}
                    />
                ) : (
                    <UserReportChart
                        report={report}
                        selectedFilters={selectedFilters}
                        groupByCompany={groupByCompany}
                    />
                )}
            </div>
        </div>
    );
};
