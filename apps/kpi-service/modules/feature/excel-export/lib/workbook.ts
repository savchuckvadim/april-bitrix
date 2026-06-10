import { Workbook, Worksheet, Row } from 'exceljs';

// Единые стили шапки (перенесено с бэкендового excel-report.service.ts)
const HEADER_FONT = { bold: true, color: { argb: 'FFFFFFFF' } } as const;
const HEADER_FILL = {
    type: 'pattern' as const,
    pattern: 'solid' as const,
    fgColor: { argb: 'FF000000' },
};
const TITLE_FILL = {
    type: 'pattern' as const,
    pattern: 'solid' as const,
    fgColor: { argb: 'FFDDDDDD' },
};
const TOTAL_FILL = {
    type: 'pattern' as const,
    pattern: 'solid' as const,
    fgColor: { argb: 'FFEEEEEE' },
};
// Подсветка топ-3 в рейтингах: золото / серебро / бронза
const RATING_FILLS = ['FFFFE08A', 'FFE6E6E6', 'FFF6D5B8'];

export function createWorkbook(): Workbook {
    const wb = new Workbook();
    wb.creator = 'KPI Service';
    wb.created = new Date();
    return wb;
}

/** Заголовок-строка (объединённая), серый фон, по центру. */
export function addTitleRow(ws: Worksheet, text: string, span = 4): Row {
    const row = ws.addRow([text]);
    const r = row.number;
    ws.mergeCells(r, 1, r, Math.max(span, 1));
    const cell = ws.getCell(r, 1);
    cell.font = { bold: true, size: 14 };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.fill = TITLE_FILL;
    return row;
}

/** Строка-шапка таблицы: чёрный фон, белый жирный текст, перенос. */
export function addHeaderRow(ws: Worksheet, headers: (string | number)[]): Row {
    const row = ws.addRow(headers);
    row.eachCell(cell => {
        cell.font = HEADER_FONT;
        cell.fill = HEADER_FILL;
        cell.alignment = {
            horizontal: 'center',
            vertical: 'middle',
            wrapText: true,
        };
    });
    return row;
}

/** Итоговая строка: жирный, светло-серый фон. */
export function addTotalRow(
    ws: Worksheet,
    label: string,
    values: (string | number)[],
): Row {
    const row = ws.addRow([label, ...values]);
    row.font = { bold: true };
    row.eachCell(cell => {
        cell.fill = TOTAL_FILL;
    });
    return row;
}

/** Автоширина колонок по содержимому (с ограничением). */
export function autoWidth(ws: Worksheet, min = 10, max = 48): void {
    ws.columns.forEach(column => {
        let width = min;
        column.eachCell?.({ includeEmpty: false }, cell => {
            const len = String(cell.value ?? '').length + 2;
            if (len > width) width = len;
        });
        column.width = Math.min(width, max);
    });
}

export interface RatingRow {
    name: string;
    value: number;
}

/**
 * Лист рейтинга: места 1..N по метрике, подсветка топ-3.
 * Используется, когда в срезе несколько сотрудников/компаний.
 */
export function addRatingSheet(
    wb: Workbook,
    sheetTitle: string,
    metricLabel: string,
    rows: RatingRow[],
    formatValue: (v: number) => string | number = v => v,
): Worksheet {
    const ws = wb.addWorksheet(sheetTitle);
    addHeaderRow(ws, ['Место', 'Название', metricLabel]);
    const sorted = [...rows].sort((a, b) => b.value - a.value);
    sorted.forEach((item, index) => {
        const row = ws.addRow([index + 1, item.name, formatValue(item.value)]);
        const fill = RATING_FILLS[index];
        if (fill) {
            row.eachCell(cell => {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: fill },
                };
            });
        }
    });
    autoWidth(ws);
    return ws;
}

export interface MetricRating {
    /** Название показателя (действия) */
    label: string;
    rows: RatingRow[];
    formatValue?: (v: number) => string | number;
}

/**
 * Лист с рейтингами по нескольким показателям: для каждого показателя —
 * отдельный ранжированный блок (места 1..N, подсветка топ-3), идущие стопкой.
 * Используется, когда нужно ранжировать сразу по всем действиям из фильтра.
 */
export function addMultiMetricRatingSheet(
    wb: Workbook,
    sheetTitle: string,
    metrics: MetricRating[],
): Worksheet {
    const ws = wb.addWorksheet(sheetTitle);
    metrics.forEach(metric => {
        addTitleRow(ws, metric.label, 3);
        addHeaderRow(ws, ['Место', 'Сотрудник', metric.label]);
        const fmt = metric.formatValue ?? (v => v);
        const sorted = [...metric.rows].sort((a, b) => b.value - a.value);
        sorted.forEach((item, index) => {
            const row = ws.addRow([index + 1, item.name, fmt(item.value)]);
            const fill = RATING_FILLS[index];
            if (fill) {
                row.eachCell(cell => {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: fill },
                    };
                });
            }
        });
        ws.addRow([]); // разделитель между блоками
    });
    autoWidth(ws);
    return ws;
}

/** Вставка PNG (dataURL) в лист. */
export function embedPng(
    wb: Workbook,
    ws: Worksheet,
    pngDataUrl: string,
    anchor: { col: number; row: number; width: number; height: number },
): void {
    const imageId = wb.addImage({ base64: pngDataUrl, extension: 'png' });
    ws.addImage(imageId, {
        tl: { col: anchor.col, row: anchor.row },
        ext: { width: anchor.width, height: anchor.height },
    });
}

/** Скачивание книги как .xlsx (приём из download-thunk.ts). */
export async function downloadWorkbook(
    wb: Workbook,
    filename: string,
): Promise<void> {
    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
}

/** Денежный/числовой формат: разделители тысяч, без дробей по умолчанию. */
export function formatNumber(value: number, fractionDigits = 0): string {
    return Number.isFinite(value)
        ? value.toLocaleString('ru-RU', {
              minimumFractionDigits: fractionDigits,
              maximumFractionDigits: fractionDigits,
          })
        : '0';
}
