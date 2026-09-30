import { afterEach, describe, expect, it, vi } from 'vitest';
import type { RTableProps } from '@/modules/shared';
import {
    csvRowsToContent,
    downloadCsvRows,
    exportTableToCSV,
    tableToCsvRows,
} from '../lib/export-util';

/** Эталон: прежний алгоритм exportTableToCSV (до выноса downloadCsvRows). */
const legacyCsvContent = (tableData: RTableProps): string => {
    const firstRow = tableData.data[0];
    if (!firstRow) return '';
    const headers = [
        tableData.firstCellName,
        ...firstRow.actions.map(a => a.name),
    ];
    const rows = [headers];
    tableData.data.forEach(item => {
        rows.push([item.name, ...item.actions.map(a => String(a.value))]);
    });
    return rows
        .map(row =>
            row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','),
        )
        .join('\n');
};

const TABLE: RTableProps = {
    code: 'report',
    firstCellName: 'Менеджер',
    data: [
        {
            id: 1,
            name: 'Иванов "Ваня" Иван',
            actions: [
                { name: 'Звонки, шт.', value: 12, code: 'call' },
                { name: 'Конверсия', value: 6.4, code: 'conv' },
                { name: 'Строка\nс переносом', value: 0 },
            ],
        },
        {
            id: 2,
            name: 'Петров, Пётр',
            actions: [
                { name: 'Звонки, шт.', value: -3 },
                { name: 'Конверсия', value: Number.NaN },
                { name: 'Строка\nс переносом', value: 1500000 },
            ],
        },
    ],
};

interface DownloadCapture {
    blob: Blob | null;
    href: string | null;
    download: string | null;
    clicks: number;
}

/** Подменяет document/URL (среда node) и ловит Blob скачивания. */
const stubDownload = (): DownloadCapture => {
    const capture: DownloadCapture = {
        blob: null,
        href: null,
        download: null,
        clicks: 0,
    };
    const link = {
        style: { visibility: '' },
        setAttribute: (name: string, value: string) => {
            if (name === 'href') capture.href = value;
            if (name === 'download') capture.download = value;
        },
        click: () => {
            capture.clicks += 1;
        },
    };
    vi.stubGlobal('document', {
        createElement: () => link,
        body: { appendChild: () => link, removeChild: () => link },
    });
    vi.stubGlobal('URL', {
        createObjectURL: (blob: Blob) => {
            capture.blob = blob;
            return 'blob:csv';
        },
    });
    return capture;
};

const blobBytes = async (blob: Blob | null): Promise<Buffer> => {
    if (!blob) throw new Error('файл не скачан');
    return Buffer.from(await blob.arrayBuffer());
};

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('export-util — строки CSV', () => {
    it('tableToCsvRows + csvRowsToContent совпадают с прежним экспортом', () => {
        expect(csvRowsToContent(tableToCsvRows(TABLE))).toBe(
            legacyCsvContent(TABLE),
        );
    });

    it('кавычки удваиваются, каждая ячейка в кавычках, строки через \n', () => {
        expect(csvRowsToContent([['a"b', 'c,d'], ['', 'е\nж']])).toBe(
            '"a""b","c,d"\n"","е\nж"',
        );
    });

    it('пустая таблица → нет строк', () => {
        expect(tableToCsvRows({ ...TABLE, data: [] })).toEqual([]);
    });
});

describe('export-util — скачивание', () => {
    it('exportTableToCSV пишет байт в байт прежний файл (BOM + CSV, text/csv)', async () => {
        const capture = stubDownload();
        exportTableToCSV(TABLE, 'kpi.csv');
        const expected = Buffer.from('\ufeff' + legacyCsvContent(TABLE), 'utf8');
        expect((await blobBytes(capture.blob)).equals(expected)).toBe(true);
        expect(capture.blob?.type).toBe('text/csv;charset=utf-8;');
        expect(capture.href).toBe('blob:csv');
        expect(capture.download).toBe('kpi.csv');
        expect(capture.clicks).toBe(1);
    });

    it('downloadCsvRows пишет строки как есть', async () => {
        const capture = stubDownload();
        downloadCsvRows([['Менеджер', 'Оценка'], ['Иванов', 'мало данных']], 'ai.csv');
        const expected = Buffer.from(
            '\ufeff"Менеджер","Оценка"\n"Иванов","мало данных"',
            'utf8',
        );
        expect((await blobBytes(capture.blob)).equals(expected)).toBe(true);
        expect(capture.download).toBe('ai.csv');
    });

    it('пустые строки / пустая таблица — ничего не скачивается', () => {
        const capture = stubDownload();
        downloadCsvRows([], 'empty.csv');
        exportTableToCSV({ ...TABLE, data: [] });
        expect(capture.clicks).toBe(0);
        expect(capture.blob).toBeNull();
    });
});
