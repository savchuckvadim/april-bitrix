import React, { useMemo } from 'react';
import { VirtualList } from '@workspace/ui/components/virtual-list';
import { PeriodFilter, TimelineMode } from '../model/types';
import {
    getYearsInPeriod,
    getMonthlyLabels,
    TimelineCompanyRow,
} from '../lib/utils/timeline.utils';
import { CompanyRow } from '../components/CompanyRow';
import { useApp } from '@/modules/app';

interface TimelineTableProps {
    /** Строки с предрассчитанными метриками (единый расчёт в родителе). */
    rows: TimelineCompanyRow[];
    periodFilter: PeriodFilter;
    timelineMode: TimelineMode;
    expandedCompanies: Set<number>;
    onToggleCompany: (companyId: number) => void;
}

/** Ширины колонок grid-шаблона (общие для шапки и строк). */
const NAME_COL = 200;
const MONTH_COL = 56;
const INDEX_COL = 96;
const STATS_COL = 360;

/**
 * Таблица таймлайна: виртуализация по строкам-компаниям (VirtualList из
 * packages/ui) — в DOM живут только видимые строки вместо всех компаний
 * сразу. Разметка grid c фиксированным шаблоном колонок (ушёл дорогой
 * auto table layout), шапка sticky.
 *
 * Excel-экспорт НЕ зависит от таблицы: он берёт полный filteredCompanies
 * в DealsReportTimelineCompact.
 */
export const TimelineTable: React.FC<TimelineTableProps> = ({
    rows,
    periodFilter,
    timelineMode,
    expandedCompanies,
    onToggleCompany,
}) => {
    const { domain } = useApp();
    const monthlyLabels = useMemo(() => getMonthlyLabels(), []);
    const years = useMemo(
        () =>
            getYearsInPeriod(
                new Date(periodFilter.startDate),
                new Date(periodFilter.endDate),
            ),
        [periodFilter.startDate, periodFilter.endDate],
    );
    const hasMultipleYears = years.length > 1;

    const { gridTemplate, minWidth } = useMemo(() => {
        const monthsPart =
            timelineMode === 'detailed'
                ? `repeat(12, minmax(${MONTH_COL}px, 1fr))`
                : `minmax(${12 * MONTH_COL}px, 1fr)`;
        const indexPart = hasMultipleYears ? ` ${INDEX_COL}px` : '';
        return {
            gridTemplate: `${NAME_COL}px ${monthsPart}${indexPart} ${STATS_COL}px`,
            minWidth:
                NAME_COL +
                12 * MONTH_COL +
                (hasMultipleYears ? INDEX_COL : 0) +
                STATS_COL,
        };
    }, [timelineMode, hasMultipleYears]);

    // Оценка высоты строки до измерения: полосы лет + подпись компании.
    const estimateSize = hasMultipleYears ? 96 : 84;

    const header = (
        <div
            className="sticky top-0 z-10 grid border-b bg-card text-sm font-medium text-muted-foreground"
            style={{ gridTemplateColumns: gridTemplate, minWidth }}
        >
            <div className="p-2">Компания</div>
            {timelineMode === 'detailed' ? (
                monthlyLabels.map((month, index) => (
                    <div key={index} className="p-2 text-center">
                        {month}
                    </div>
                ))
            ) : (
                <div className="p-2 text-center">
                    {timelineMode === 'average'
                        ? 'Средние показатели по месяцам'
                        : 'Итоговые показатели по месяцам'}
                </div>
            )}
            {hasMultipleYears && (
                <div className="p-2 text-center">Итоговая индексация</div>
            )}
            <div className="p-2">Статистика</div>
        </div>
    );

    return (
        <VirtualList
            items={rows}
            className="max-h-[700px] rounded-md border bg-card"
            estimateSize={estimateSize}
            overscan={10}
            getItemKey={row => row.companyData.company.id}
            header={header}
            renderItem={row => (
                <CompanyRow
                    row={row}
                    monthlyLabels={monthlyLabels}
                    years={years}
                    hasMultipleYears={hasMultipleYears}
                    timelineMode={timelineMode}
                    isExpanded={expandedCompanies.has(
                        row.companyData.company.id,
                    )}
                    onToggle={onToggleCompany}
                    domain={domain}
                    gridTemplate={gridTemplate}
                    minWidth={minWidth}
                />
            )}
        />
    );
};
