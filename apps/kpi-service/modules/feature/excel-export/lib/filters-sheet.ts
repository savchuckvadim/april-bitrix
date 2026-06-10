import { Workbook } from 'exceljs';
import { addTitleRow, addHeaderRow, autoWidth } from './workbook';

export interface FilterLine {
    label: string;
    value: string;
}

/** Лист «Фильтры» — человекочитаемое описание применённого среза. */
export function addFiltersSheet(wb: Workbook, lines: FilterLine[]): void {
    const ws = wb.addWorksheet('Фильтры');
    addTitleRow(ws, 'Применённые фильтры', 2);
    ws.addRow([]);
    addHeaderRow(ws, ['Параметр', 'Значение']);
    lines.forEach(line => ws.addRow([line.label, line.value]));
    autoWidth(ws);
}
