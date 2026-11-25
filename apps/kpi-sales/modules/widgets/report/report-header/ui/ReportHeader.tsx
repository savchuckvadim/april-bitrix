'use client';
import { PAGE_HEADER_ROW_CLASS } from '@/modules/shared';
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
    <div className={PAGE_HEADER_ROW_CLASS}>
        <ReportTitle />
        <ReportHeaderActions
            isFilterOpen={isFilterOpen}
            setIsFilterOpen={setIsFilterOpen}
        />
    </div>
);
