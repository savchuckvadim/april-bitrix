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
 * Панель фильтров отчёта: даты + отделы + события; на странице
 * сотрудника — только даты.
 *
 * Рендерится ВНУТРИ sticky-хедера (ReportProvider), прямо под строкой кнопок:
 * открытая, она видна при любой прокрутке страницы. Высоту ограничивает
 * хедер (колонка не выше окна), панель берёт остаток и прокручивается сама;
 * фон непрозрачный — контент страницы сквозь неё не просвечивает. Поповеры
 * внутри (календарь периода) и диалог дерева отделов рисуются порталом в
 * body, поэтому прокрутка панели их не обрезает.
 */
export const ReportFilter = ({ isOpen }: ReportFilterProps) => {
    const isUserReport = useIsUserReport();

    if (!isOpen) return null;

    return (
        <div
            role="region"
            aria-label="Фильтры отчёта"
            className="min-h-0 overflow-y-auto overscroll-contain bg-background px-7 pb-3"
        >
            <Card>
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
        </div>
    );
};
