'use client';

import { ReactNode, useMemo } from 'react';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@workspace/ui/components/tabs';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    buildDepartmentSections,
    buildGroupSections,
    filterSectionsByPresent,
    StructureSection,
} from '../lib/group-report.util';
import { SectionList } from './components/SectionList';

interface ReportGroupTabsProps {
    /** ID сотрудников, реально присутствующих в данных (пустые секции скрываются). */
    presentUserIds: number[];
    /** Полный сводный блок — как без разбивки. */
    renderSummary: () => ReactNode;
    /** Блок секции: получает набор сотрудников отдела/группы. */
    renderSection: (userIds: Set<number>) => ReactNode;
    /** Хвост вкладки «По отделам» (рейтинги-победители и т.п.). */
    renderDepartmentsFooter?: (sections: StructureSection[]) => ReactNode;
    /** Хвост вкладки «По группам». */
    renderGroupsFooter?: (sections: StructureSection[]) => ReactNode;
}

/**
 * Вкладки разбивки: Сводный / По отделам (когда отделов больше одного) /
 * По группам (когда группы есть). Данные не знает — работает по структуре
 * department-слайса и колбэкам рендера, поэтому одинаково подходит для
 * KPI-отчёта, статистики звонков и объединённого отчёта.
 */
export const ReportGroupTabs = ({
    presentUserIds,
    renderSummary,
    renderSection,
    renderDepartmentsFooter,
    renderGroupsFooter,
}: ReportGroupTabsProps) => {
    const departments = useAppSelector(
        state => state.department.departments,
    );
    const isMulti = useAppSelector(state => state.department.isMulti);

    const present = useMemo(
        () => new Set(presentUserIds),
        [presentUserIds],
    );
    const byDepartments = useMemo(
        () =>
            filterSectionsByPresent(
                buildDepartmentSections(departments),
                present,
            ),
        [departments, present],
    );
    const byGroups = useMemo(
        () =>
            filterSectionsByPresent(
                buildGroupSections(departments, isMulti),
                present,
            ),
        [departments, isMulti, present],
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
                    {renderDepartmentsFooter?.(byDepartments)}
                </TabsContent>
            )}
            {showGroups && (
                <TabsContent value="groups">
                    <SectionList
                        sections={byGroups}
                        renderSection={renderSection}
                    />
                    {renderGroupsFooter?.(byGroups)}
                </TabsContent>
            )}
        </Tabs>
    );
};
