'use client'
import React, { useMemo } from 'react';
import { useReport } from '../../model';
import { Button } from '@workspace/ui/components/button';
import { DownLoad } from '@/modules/feature';
import { ThemeTogglePanel } from './components/ThemeTogglerPanel/ThemeTogglePanel';
import SaveFilter from './components/SaveFilter/SaveFilter';
import { format, parse, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { usePathname } from 'next/navigation';
const getFormattedDate = (input: string | '2025-10-01' | undefined) => {
    if (!input) return '';
    const date = parseISO(input);

    const formatted = format(date, "d MMMM yyyy 'г'", { locale: ru });

    return formatted;
}

export default function ReportHeader({
    isFilterOpen,
    setIsFilterOpen,
}: {
    isFilterOpen: boolean;
    setIsFilterOpen: (isFilterOpen: boolean) => void;
}) {
    const { date, handleUpdateReport } = useReport();
    const formattedDate = 'с ' + getFormattedDate(date.from || '') + ' по ' + getFormattedDate(date.to || '');
    let isUserReport = false;
    const pathname = usePathname();
    if (pathname === '/report/user') isUserReport = true;
    return (
        <div className="flex justify-between items-center w-full h-12">
            <div className="flex flex-row">
                <ThemeTogglePanel />
                <h1 className="text-md ml-2 font-bold">KPI
                    <span className="text-xs text-foreground-muted ml-2">{formattedDate}</span> </h1>

            </div>
            <div className="flex flex-row items-center mt-2">
                <div className="mr-2">{isFilterOpen && <SaveFilter />}</div>
                <div className="mr-2">
                    {isFilterOpen ? (
                        <>
                            <Button
                                variant="default"
                                className="h-8 cursor-pointer"
                                onClick={() => {
                                    handleUpdateReport();
                                    setIsFilterOpen(!isFilterOpen);
                                }}
                            >
                                {'Применить'}
                            </Button>
                        </>
                    ) : (
                        !isUserReport && <DownLoad />
                    )}
                </div>
                <Button
                    variant="outline"
                    className="h-8 cursor-pointer"
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                >
                    {isFilterOpen ? 'Скрыть фильтры' : 'Показать фильтры'}
                </Button>
            </div>
        </div>
    );
}
