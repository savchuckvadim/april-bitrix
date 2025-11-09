import { ReportData } from '../model/types/report/report-type';
import { RTableProps } from '@/modules/shared';
import { getReportTableData } from './ui-util';

/**
 * Экспорт таблицы в CSV формат
 */
export const exportTableToCSV = (tableData: RTableProps, filename: string = 'table.csv') => {
    if (!tableData.data || tableData.data.length === 0) {
        return;
    }

    // Создаем заголовки
    const firstRow = tableData.data[0];
    if (!firstRow) return;
    const headers = [tableData.firstCellName, ...firstRow.actions.map(a => a.name)];
    const rows = [headers];

    // Добавляем данные
    tableData.data.forEach(item => {
        const row = [
            item.name,
            ...item.actions.map(a => String(a.value))
        ];
        rows.push(row);
    });

    // Конвертируем в CSV
    const csvContent = rows.map(row =>
        row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    // Скачиваем файл
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

/**
 * Экспорт ReportData в CSV
 */
export const exportReportDataToCSV = (report: ReportData[], filename: string = 'kpi-report.csv') => {
    const tableData = getReportTableData(report);
    exportTableToCSV(tableData, filename);
};

/**
 * Экспорт объединенной таблицы в CSV
 */
export const exportMergedTableToCSV = (tableData: RTableProps, filename: string = 'merged-report.csv') => {
    exportTableToCSV(tableData, filename);
};

/**
 * Экспорт графика как изображения (скриншот элемента)
 */
export const exportChartAsImage = (chartElementId: string, filename: string = 'chart.png') => {
    const element = document.getElementById(chartElementId);
    if (!element) {
        console.error('Chart element not found');
        return;
    }

    // Используем html2canvas если доступен, иначе просто показываем сообщение
    if (typeof window !== 'undefined' && (window as any).html2canvas) {
        (window as any).html2canvas(element).then((canvas: HTMLCanvasElement) => {
            const link = document.createElement('a');
            link.download = filename;
            link.href = canvas.toDataURL('image/png');
            link.click();
        });
    } else {
        // Fallback: копируем данные графика в буфер обмена или показываем сообщение
        alert('Для экспорта графика установите библиотеку html2canvas');
    }
};

