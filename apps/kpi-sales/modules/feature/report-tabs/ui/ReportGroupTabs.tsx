'use client';

import { ReactNode, useMemo } from 'react';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@workspace/ui/components/tabs';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import type { ReportData } from '@/modules/entities/report/model/types/report/report-type';
import {
    groupReportByDepartments,
    groupReportByGroups,
} from '../lib/group-report.util';
import { SectionList } from './components/SectionList';

interface ReportGroupTabsProps {
    report: ReportData[];
    /** Полный сводный блок (таблица + графики) — как раньше. */
    renderSummary: () => ReactNode;
    /** Компактный блок секции (таблица + итоги) для отдела/группы. */
    renderSection: (sectionReport: ReportData[]) => ReactNode;
}

/**
 * Вкладки разбивки отчёта: Сводный / По отделам (мультипортал) /
 * По группам (если группы есть). Без отделов и групп — просто сводный.
 */
export const ReportGroupTabs = ({
    report,
    renderSummary,
    renderSection,
}: ReportGroupTabsProps) => {
    const departments = useAppSelector(
        state => state.department.departments,
    );
    const isMulti = useAppSelector(state => state.department.isMulti);

    const byDepartments = useMemo(
        () => groupReportByDepartments(report, departments),
        [report, departments],
    );
    const byGroups = useMemo(
        () => groupReportByGroups(report, departments, isMulti),
        [report, departments, isMulti],
    );

    const showDepartments = byDepartments.length > 1;
    const showGroups = byGroups.length > 0;

    if (!showDepartments && !showGroups) {
        return <>{renderSummary()}</>;
    }

    return (
        <Tabs defaultValue="summary">
            <TabsList>
                <TabsTrigger value="summary">Сводный</TabsTrigger>
                {showDepartments && (
                    <TabsTrigger value="departments">По отделам</TabsTrigger>
                )}
                {showGroups && (
                    <TabsTrigger value="groups">По группам</TabsTrigger>
                )}
            </TabsList>

            <TabsContent value="summary">{renderSummary()}</TabsContent>
            {showDepartments && (
                <TabsContent value="departments">
                    <SectionList
                        sections={byDepartments}
                        renderSection={renderSection}
                    />
                </TabsContent>
            )}
            {showGroups && (
                <TabsContent value="groups">
                    <SectionList
                        sections={byGroups}
                        renderSection={renderSection}
                    />
                </TabsContent>
            )}
        </Tabs>
    );
};
