import type { ReportData } from '../model/types/report/report-type';
import type { RTableProps } from '@/modules/shared';
import { getReportTableData } from './ui-util';

/** BOM в начале файла — Excel открывает UTF-8 CSV с кириллицей без кракозябр. */
const CSV_BOM = '\ufeff';
const CSV_MIME = 'text/csv;charset=utf-8;';

/** Ячейка CSV: всегда в кавычках, внутренние кавычки удваиваются. */
const toCsvCell = (cell: string): string => `"${cell.replace(/"/g, '""')}"`;

/** Строки → текст CSV: запятая между ячейками, \n между строками (без BOM). */
export const csvRowsToContent = (rows: readonly (readonly string[])[]): string =>
    rows.map(row => row.map(toCsvCell).join(',')).join('\n');

/**
 * RTableProps → строки CSV: шапка (firstCellName + имена показателей первой
 * строки) и строки «имя + значения». Пустая таблица → [].
 */
export const tableToCsvRows = (tableData: RTableProps): string[][] => {
    const firstRow = tableData.data?.[0];
    if (!firstRow) return [];
    const headers = [
        String(tableData.firstCellName),
        ...firstRow.actions.map(a => String(a.name)),
    ];
    const rows = tableData.data.map(item => [
        String(item.name),
        ...item.actions.map(a => String(a.value)),
    ]);
    return [headers, ...rows];
};

/**
 * Скачивание строк CSV файлом (BOM, кавычки, \n). Пустой набор строк —
 * ничего не скачивается.
 */
export const downloadCsvRows = (
    rows: readonly (readonly string[])[],
    filename: string,
): void => {
    if (rows.length === 0) return;
    const blob = new Blob([CSV_BOM + csvRowsToContent(rows)], {
        type: CSV_MIME,
    });
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
 * Экспорт таблицы в CSV формат
 */
export const exportTableToCSV = (tableData: RTableProps, filename: string = 'table.csv') => {
    downloadCsvRows(tableToCsvRows(tableData), filename);
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

/** Окно с необязательной глобальной html2canvas (подключается отдельно). */
interface Html2CanvasWindow {
    html2canvas?: (element: HTMLElement) => Promise<HTMLCanvasElement>;
}

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
    const html2canvas =
        typeof window !== 'undefined'
            ? (window as Window & Html2CanvasWindow).html2canvas
            : undefined;
    if (html2canvas) {
        html2canvas(element).then((canvas: HTMLCanvasElement) => {
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
