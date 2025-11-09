'use client'
import React from 'react';
import { Button } from '@workspace/ui/components/button';
import { FileSpreadsheet, Download } from 'lucide-react';
import { getAllBlockStates } from '../../lib/localStorage-util';
import { exportTableToCSV } from '../../lib/export-util';
import { ReportData } from '../../model/types/report/report-type';
import { ReportCallingData } from '@/modules/entities/calling-statistics';
import { getReportTableData } from '../../lib/ui-util';
import { getCallingStatisticsTableData } from '@/modules/entities/calling-statistics/lib/ui-util';
import { getMergedReportsData } from '@/modules/feature/merged-kpi-calling-report/lib/merge-reports.util';

interface ExportAllBlocksButtonProps {
    report: ReportData[];
    callingsReport?: ReportCallingData[];
}

export const ExportAllBlocksButton: React.FC<ExportAllBlocksButtonProps> = ({
    report,
    callingsReport,
}) => {
    const handleExportAll = () => {
        const blockStates = getAllBlockStates();
        const blocksToExport: string[] = [];

        // Собираем все блоки, отмеченные для экспорта
        Object.entries(blockStates).forEach(([blockId, state]) => {
            if (state.isIncludedInExcel) {
                blocksToExport.push(blockId);
            }
        });

        if (blocksToExport.length === 0) {
            alert('Нет блоков, отмеченных для экспорта. Отметьте блоки чекбоксом "В Excel"');
            return;
        }

        // Экспортируем каждый блок
        blocksToExport.forEach((blockId, index) => {
            setTimeout(() => {
                try {
                    switch (blockId) {
                        case 'kpi-report-table':
                            const tableData1 = getReportTableData(report);
                            exportTableToCSV(tableData1, `kpi-report-managers-${index + 1}.csv`);
                            break;
                        case 'kpi-report-total-table':
                            const tableData2 = getReportTableData(report);
                            if (tableData2.data[0]) {
                                const totalData = {
                                    code: 'total',
                                    firstCellName: 'Показатель',
                                    data: [{
                                        name: 'Итого',
                                        actions: tableData2.data[0].actions.map(action => {
                                            const total = tableData2.data.reduce((sum, user) => {
                                                const userAction = user.actions.find(a => a.name === action.name);
                                                return sum + (userAction?.value || 0);
                                            }, 0);
                                            return { name: action.name, value: total };
                                        })
                                    }]
                                };
                                exportTableToCSV(totalData, `kpi-report-total-${index + 1}.csv`);
                            }
                            break;
                        case 'calling-statistics':
                            if (callingsReport && callingsReport.length > 0) {
                                const tableData3 = getCallingStatisticsTableData(callingsReport);
                                exportTableToCSV(tableData3, `calling-statistics-${index + 1}.csv`);
                            }
                            break;
                        case 'merged-report':
                            if (report && callingsReport) {
                                const tableKpiData = getReportTableData(report);
                                const tableCallingsData = getCallingStatisticsTableData(callingsReport);
                                const mergedData = getMergedReportsData(tableKpiData, tableCallingsData);
                                exportTableToCSV(mergedData, `merged-report-${index + 1}.csv`);
                            }
                            break;
                    }
                } catch (error) {
                    console.error(`Error exporting block ${blockId}:`, error);
                }
            }, index * 500); // Небольшая задержка между экспортами
        });

        alert(`Экспорт ${blocksToExport.length} блоков начат. Файлы будут скачаны последовательно.`);
    };

    return (
        <Button
            variant="default"
            size="sm"
            onClick={handleExportAll}
            className="flex items-center gap-2"
        >
            <FileSpreadsheet className="h-4 w-4" />
            <Download className="h-4 w-4" />
            Экспорт всех отмеченных
        </Button>
    );
};

