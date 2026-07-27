'use client';
import { ReportTitle } from './ReportTitle';
import { ReportHeaderActions } from './ReportHeaderActions';

interface ReportHeaderProps {
    isFilterOpen: boolean;
    setIsFilterOpen: (isFilterOpen: boolean) => void;
}

/** Хедер отчёта: заголовок с периодом слева, действия справа. */
export const ReportHeader = ({
    isFilterOpen,
    setIsFilterOpen,
}: ReportHeaderProps) => (
    <div className="flex h-12 w-full items-center justify-between">
        <ReportTitle />
        <ReportHeaderActions
            isFilterOpen={isFilterOpen}
            setIsFilterOpen={setIsFilterOpen}
        />
    </div>
);
