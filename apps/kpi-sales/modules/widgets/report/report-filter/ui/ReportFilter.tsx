'use client';
import React from 'react';
import dynamic from 'next/dynamic';
import { DatesFilter } from '@/modules/entities/report';
import { ActionsFilter } from '@/modules/entities/report';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import { useIsUserReport } from '../../lib/use-is-user-report';

// Дерево отделов тяжёлое — грузим лениво при первом открытии фильтров.
const CompactDepartmentFilter = dynamic(
    () =>
        import('@/modules/feature/report-filter').then(
            m => m.CompactDepartmentFilter,
        ),
    {
        ssr: false,
        loading: () => (
            <div className="h-40 animate-pulse rounded-md bg-muted" />
        ),
    },
);

interface ReportFilterProps {
    isOpen: boolean;
}

/**
 * Карточка фильтров отчёта: даты + отделы + события; на странице
 * сотрудника — только даты.
 */
export const ReportFilter = ({ isOpen }: ReportFilterProps) => {
    const isUserReport = useIsUserReport();

    if (!isOpen) return null;

    return (
        <Card className="mb-4">
            <CardHeader>
                <CardTitle>Фильтры</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                        <DatesFilter />
                    </div>

                    <div className="space-y-4">
                        {!isUserReport && <CompactDepartmentFilter />}
                    </div>
                </div>
            </CardContent>

            {!isUserReport && (
                <CardContent>
                    <ActionsFilter />
                </CardContent>
            )}
        </Card>
    );
};
