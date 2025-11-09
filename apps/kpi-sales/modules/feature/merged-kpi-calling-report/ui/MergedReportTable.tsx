'use client'
import React, { useMemo, useState } from 'react';
import { ReportCallingData } from "@/modules/entities/calling-statistics";
import { getCallingStatisticsTableData } from "@/modules/entities/calling-statistics/lib/ui-util";
import { getReportTableData } from "@/modules/entities/report/lib/ui-util";
import { ReportData } from "@/modules/entities/report/model/types/report/report-type";
import { RTable } from "@/modules/shared";
import { getMergedReportsData } from "../lib/merge-reports.util";
import { MergedReportFilters } from "./MergedReportFilters";
import { MergedReportChart } from "./MergedReportChart";
import { MergedReportTotalTable } from "./MergedReportTotalTable";
import { MergedReportTotalChart } from "./MergedReportTotalChart";
import { ManagersRating } from "./ManagersRating";


interface MergedReportTableProps {
    report: ReportData[];
    callingsReport: ReportCallingData[];
}


export const MergedReportTable: React.FC<MergedReportTableProps> = ({ report, callingsReport }) => {
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const [selectedActions, setSelectedActions] = useState<string[]>([]);
    debugger;
    // Вычисляем данные (всегда, даже если нет данных)
    const tableKpiData = useMemo(() => {
        if (!report || !report.length || !report[0]?.kpi) return null;
        return getReportTableData(report);
    }, [report]);

    const tableCallingsData = useMemo(() => {
        if (!callingsReport || !callingsReport.length) return null;
        return getCallingStatisticsTableData(callingsReport);
    }, [callingsReport]);

    const mergedReportsData = useMemo(() => {
        if (!tableKpiData || !tableCallingsData) return null;
        return getMergedReportsData(tableKpiData, tableCallingsData);
    }, [tableKpiData, tableCallingsData]);

    // Инициализация фильтров при первой загрузке
    React.useEffect(() => {
        if (!mergedReportsData || mergedReportsData.data.length === 0) return;

        if (selectedUsers.length === 0) {
            const allUserIds = mergedReportsData.data
                .map(item => item.id)
                .filter((id): id is number => id !== undefined);
            setSelectedUsers(allUserIds);
        }

        if (mergedReportsData.data[0]?.actions && mergedReportsData.data[0].actions.length > 0 && selectedActions.length === 0) {
            const allActionNames = mergedReportsData.data[0].actions.map(action => action.name);
            debugger
            setSelectedActions(allActionNames);
        }
    }, [mergedReportsData, selectedUsers.length, selectedActions.length]);

    // Фильтрация данных
    const filteredData = useMemo(() => {
        if (!mergedReportsData || !mergedReportsData.data) return [];

        return mergedReportsData.data
            .filter(user => {
                if (selectedUsers.length === 0) return true;
                return user.id !== undefined && selectedUsers.includes(user.id);
            })
            .map(user => ({
                ...user,
                actions: user.actions.filter(action => {
                    if (selectedActions.length === 0) return true;
                    return selectedActions.includes(action.name);
                })
            }));
    }, [mergedReportsData, selectedUsers, selectedActions]);

    // Ранний return ПОСЛЕ всех хуков
    if (!report || !report.length || !report[0]?.kpi || !callingsReport || !callingsReport.length || !mergedReportsData) {
        return <div>Нет данных для отображения</div>;
    }

    // Обработчики фильтров
    const handleUserChange = (userId: number, checked: boolean) => {
        if (checked) {
            setSelectedUsers(prev => [...prev, userId]);
        } else {
            setSelectedUsers(prev => prev.filter(id => id !== userId));
        }
    };

    const handleActionChange = (actionName: string, checked: boolean) => {
        if (checked) {
            setSelectedActions(prev => [...prev, actionName]);
        } else {
            setSelectedActions(prev => prev.filter(name => name !== actionName));
        }
    };

    const handleSelectAllUsers = (checked: boolean) => {
        if (checked) {
            const allUserIds = mergedReportsData.data
                .map(item => item.id)
                .filter((id): id is number => id !== undefined);
            setSelectedUsers(allUserIds);
        } else {
            setSelectedUsers([]);
        }
    };

    const handleSelectAllActions = (checked: boolean) => {
        if (checked) {
            const allActionNames = mergedReportsData.data[0]?.actions.map(action => action.name) || [];
            setSelectedActions(allActionNames);
        } else {
            setSelectedActions([]);
        }
    };

    return (
        <div className="space-y-4">
            <MergedReportFilters
                data={mergedReportsData.data}
                selectedUsers={selectedUsers}
                selectedActions={selectedActions}
                onUserChange={handleUserChange}
                onActionChange={handleActionChange}
                onSelectAllUsers={handleSelectAllUsers}
                onSelectAllActions={handleSelectAllActions}
            />






            {tableKpiData && (
                <RTable
                    code={tableKpiData.code}
                    firstCellName={tableKpiData.firstCellName}
                    data={filteredData}
                    withLink={true}
                />
            )}
            <MergedReportChart
                data={filteredData}
                selectedActions={selectedActions}
            />

            <MergedReportTotalTable
                data={filteredData}
                selectedActions={selectedActions}
            />

            <MergedReportTotalChart
                data={filteredData}
                selectedActions={selectedActions}
            />


            {/* <ManagersRating
                data={filteredData}
                selectedActions={selectedActions}
            /> */}
        </div>
    );
};
