import React from 'react';
import { TimelineMode } from '../model/types';
import { TimelineCompanyRow } from '../lib/utils/timeline.utils';
import { CompanyStatsComponent } from './CompanyStats';
import { TimelineCell } from './TimelineCell';
import { CrossYearIndexColumn } from './CrossYearIndexColumn';
import { CompanyDealsDetails } from './CompanyDealsDetails';

interface CompanyRowProps {
    row: TimelineCompanyRow;
    monthlyLabels: string[];
    years: number[];
    hasMultipleYears: boolean;
    timelineMode: TimelineMode;
    isExpanded: boolean;
    onToggle: (companyId: number) => void;
    domain: string;
    /** Общий grid-шаблон колонок (одинаков с шапкой таблицы). */
    gridTemplate: string;
    /** Общая минимальная ширина строки/шапки — даёт горизонтальный скролл. */
    minWidth: number;
}

/**
 * Строка компании в grid-разметке (вместо `<table>`: auto table layout по
 * всем ячейкам был одной из причин зависания, а виртуализация с absolute-
 * позиционированием строк с `<tr>` не дружит).
 *
 * React.memo: при скролле/раскрытии другой строки пропсы стабильны —
 * строка не пересобирается. Раскрытая детализация рендерится ВНУТРИ
 * элемента строки — виртуализатор измеряет итоговую высоту сам.
 */
export const CompanyRow: React.FC<CompanyRowProps> = React.memo(
    ({
        row,
        monthlyLabels,
        years,
        hasMultipleYears,
        timelineMode,
        isExpanded,
        onToggle,
        domain,
        gridTemplate,
        minWidth,
    }) => {
        const { companyData, stats, yearlyMatrix, crossYearIndexes } = row;
        const { company } = companyData;

        return (
            <div className="border-b bg-card" style={{ minWidth }}>
                <div
                    className="grid cursor-pointer items-center hover:bg-muted/50"
                    style={{ gridTemplateColumns: gridTemplate, minWidth }}
                    onClick={() => onToggle(company.id)}
                >
                    <div className="p-2 font-medium">
                        <div className="w-full">
                            <div
                                className="font-medium truncate text-primary"
                                title={company.title}
                            >
                                {company.title}
                            </div>
                            <p className="text-xs text-gray-500">
                                {`   ID в АРМ: ${company.armInfo || 'не установлено'}`}
                            </p>
                            <div className="text-xs text-gray-500">
                                {company.isActiveClient
                                    ? 'Активный клиент'
                                    : 'Неактивный клиент'}
                            </div>
                            <a
                                href={`https://${domain}/crm/company/details/${company.id}/`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline"
                                onClick={e => e.stopPropagation()}
                            >
                                Открыть в CRM
                            </a>
                        </div>
                    </div>

                    {timelineMode === 'detailed' ? (
                        monthlyLabels.map((_, monthIndex) => (
                            <div key={monthIndex} className="p-1">
                                <TimelineCell
                                    yearlyData={yearlyMatrix}
                                    monthIndex={monthIndex}
                                    mode={timelineMode}
                                    years={years}
                                />
                            </div>
                        ))
                    ) : (
                        <div className="p-1">
                            <div className="flex gap-1">
                                {monthlyLabels.map((_, monthIndex) => (
                                    <div key={monthIndex} className="flex-1">
                                        <TimelineCell
                                            yearlyData={yearlyMatrix}
                                            monthIndex={monthIndex}
                                            mode={timelineMode}
                                            years={years}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {hasMultipleYears && (
                        <div className="p-1">
                            <CrossYearIndexColumn
                                crossYearIndexes={crossYearIndexes}
                                yearsCount={years.length}
                            />
                        </div>
                    )}

                    <div className="p-2">
                        <CompanyStatsComponent stats={stats} />
                    </div>
                </div>

                {/* Выпадающий блок с детализацией по сделкам */}
                {isExpanded && <CompanyDealsDetails companyData={companyData} />}
            </div>
        );
    },
);

CompanyRow.displayName = 'CompanyRow';
