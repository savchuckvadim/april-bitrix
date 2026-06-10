'use client'

import { useUserReport } from "../../hooks/user-report.hook";
import { useDepartment } from "@/modules/entities/departament";
import { IUserReportItem } from "../../type/user-report.type";

import React, { useEffect, useState, useMemo } from "react";

import { Loader2, BarChart3, Table } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { useApp } from "@/modules/app";
import { UserReportHeader } from "./UserReportHeader";
import { UserReportStats } from "./UserReportStats";
import { UserReportEventTable } from "./UserReportEventTable";
import { UserReportFilters } from "./UserReportFilters";
import { UserReportChart } from "./UserReportChart";
import { ExcelExportButton } from "@/modules/feature/excel-export";
import { useDealsReport } from "@/modules/entities/deals-report/hooks/deals-report.hook";
import { useCallingStatistics } from "@/modules/entities/calling-statistics/lib/hooks/useCallingStatistics";

const BATCH_DISPLAY_SIZE = 300; // сколько показывать за раз

export const UserReport = ({ userId }: { userId: number }) => {
    const { initialized } = useApp()
    const { getUserReport, report, isFetched } = useUserReport();
    const { department } = useDepartment();
    const { deals: companies } = useDealsReport();
    const { data: callingsReport, isLoading: isCallingsLoading } = useCallingStatistics();

    const [visibleCount, setVisibleCount] = useState(BATCH_DISPLAY_SIZE);
    const [selectedFilters, setSelectedFilters] = useState<{
        action?: string;
        type?: string;
        initiative?: string;
        communication?: string;
    }>({});
    const [groupByCompany, setGroupByCompany] = useState(false);
    const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');

    // загрузка при маунте
    useEffect(() => {
        if (initialized) {
            getUserReport(userId);
        }
    }, [userId, initialized]);

    // фильтрация элементов
    const filteredReport = useMemo(() => {
        return report.filter(item => {
            if (selectedFilters.action && item.service_ork_history_ork_event_action?.value?.code !== selectedFilters.action) {
                return false;
            }
            if (selectedFilters.type && item.service_ork_history_ork_event_type?.value?.code !== selectedFilters.type) {
                return false;
            }
            if (selectedFilters.initiative && item.service_ork_history_ork_event_initiative?.value?.code !== selectedFilters.initiative) {
                return false;
            }
            if (selectedFilters.communication && item.service_ork_history_event_communication?.value?.code !== selectedFilters.communication) {
                return false;
            }
            return true;
        });
    }, [report, selectedFilters]);

    // группировка по компаниям (если включена группировка)
    const groupedReport = useMemo(() => {
        if (!groupByCompany) return filteredReport;

        // Группируем ВСЕ элементы из стейта, а не только отфильтрованные
        const allGrouped = report.reduce((acc, item) => {
            const companyIdData = item.service_ork_history_ork_crm_company?.value?.value;
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

        const filtered = groupedReport.filter(item => {
            if (selectedFilters.action && item.service_ork_history_ork_event_action?.value?.code !== selectedFilters.action) {
                return false;
            }
            if (selectedFilters.type && item.service_ork_history_ork_event_type?.value?.code !== selectedFilters.type) {
                return false;
            }
            if (selectedFilters.initiative && item.service_ork_history_ork_event_initiative?.value?.code !== selectedFilters.initiative) {
                return false;
            }
            if (selectedFilters.communication && item.service_ork_history_event_communication?.value?.code !== selectedFilters.communication) {
                return false;
            }
            return true;
        }) as (IUserReportItem & {
            isFirstInGroup?: boolean;
            companyName?: string;
            groupSize?: number;
        })[];

        // Пересчитываем isFirstInGroup для отфильтрованных элементов
        const result = filtered.map((item: IUserReportItem, index) => {
            const prevItem = index > 0 ? filtered[index - 1] : null;
            const prevCompany = prevItem?.service_ork_history_ork_crm_company?.value?.value || '';
            const currentCompany = item.service_ork_history_ork_crm_company?.value?.value || '';

            return {
                ...item,
                isFirstInGroup: prevCompany !== currentCompany
            };
        });

        return result;
    }, [groupedReport, selectedFilters, groupByCompany]);

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

    const handleExportExcel = async () => {
        const { buildUserReportWorkbook } = await import(
            "@/modules/feature/excel-export/builders/user-report.builder"
        );
        const userName = getUser
            ? `${getUser.LAST_NAME ?? ""} ${getUser.NAME ?? ""}`.trim() ||
              `Пользователь #${userId}`
            : `Пользователь #${userId}`;
        // Звонки по данному сотруднику из store (грузятся на входной точке kpi-report)
        const userCallings =
            !isCallingsLoading && callingsReport
                ? callingsReport.find(
                      c => Number(c.userId) === Number(userId),
                  )?.callings ?? null
                : null;

        // Сводка по сделкам сотрудника из отчёта по сделкам (по assignedById)
        let dealCompanies = 0;
        let dealCount = 0;
        let dealSum = 0;
        companies.forEach(c => {
            const userDeals = c.deals.filter(
                d => Number(d.assignedById) === Number(userId),
            );
            if (userDeals.length > 0) {
                dealCompanies += 1;
                dealCount += userDeals.length;
                dealSum += userDeals.reduce((s, d) => s + (+d.sum || 0), 0);
            }
        });
        const dealsSummary = {
            companies: dealCompanies,
            deals: dealCount,
            totalSum: dealSum,
        };

        await buildUserReportWorkbook({
            userName,
            userId,
            allItems: report,
            filteredItems: filteredReport,
            selectedFilters,
            groupByCompany,
            callings: userCallings,
            dealsSummary,
            // Названия компаний — из отчёта по сделкам (как в строке таблицы на экране)
            resolveCompanyName: (companyId: string | null) => {
                if (!companyId) return "";
                return (
                    companies.find(
                        c => Number(c.company.id) === Number(companyId),
                    )?.company.title || companyId
                );
            },
        });
    };

    if (!isFetched && !report.length) {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <div className="flex justify-center items-center py-20 text-gray-500">
                    <Loader2 className="animate-spin mr-2" /> Загружаем отчёт...
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto p-6 space-y-6 p-10">
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

            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                        История событий
                        {filteredReport.length !== report.length && (
                            <span className="text-sm text-gray-500 ml-2">
                                ({filteredReport.length} из {report.length})
                            </span>
                        )}
                    </h2>
                    <div className="flex items-center gap-2">
                        <ExcelExportButton
                            onBuild={handleExportExcel}
                            label="Скачать Excel"
                        />
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
