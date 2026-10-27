'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CatalogTableHelper } from '../api/catalog-table.helper';
import {
    CatalogExportMode,
    CatalogSeedSection,
    CatalogTableKind,
    TableImportReportDto,
    catalogTableInfo,
} from '../../model';

const helper = new CatalogTableHelper();

/**
 * Ключи запросов каталога, которые устаревают после записи: цены,
 * комплекты, поставки, регионы, пакеты правятся теми же таблицами.
 */
const AFFECTED_QUERY_KEYS = [
    'prof-prices',
    'complects',
    'supplies',
    'regions',
    'packages',
];

export interface ExportTableInput {
    kind: CatalogTableKind;
    mode: CatalogExportMode;
}

/** Скачивание таблицы (файл сохраняется браузером) */
export const useExportCatalogTable = () =>
    useMutation<Blob, Error, ExportTableInput>({
        mutationFn: ({ kind, mode }) => helper.export(kind, mode),
        onSuccess: (blob, { kind, mode }) => {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            const info = catalogTableInfo(kind);
            link.href = url;
            link.download =
                mode === 'blank'
                    ? info.fileName.replace('.xlsx', '-blank.xlsx')
                    : info.fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        },
    });

export interface ImportTableInput {
    kind: CatalogTableKind;
    file: File;
    dryRun: boolean;
}

/** Загрузка заполненной таблицы: проверка (dryRun) или запись */
export const useImportCatalogTable = () => {
    const queryClient = useQueryClient();

    return useMutation<TableImportReportDto[], Error, ImportTableInput>({
        mutationFn: ({ kind, file, dryRun }) =>
            helper.import(kind, file, dryRun),
        onSuccess: (_reports, { dryRun }) => {
            if (dryRun) return; // проверка ничего не меняла
            for (const key of AFFECTED_QUERY_KEYS) {
                queryClient.invalidateQueries({ queryKey: [key] });
            }
        },
    });
};

export interface SeedInput {
    sections: CatalogSeedSection[];
    dryRun: boolean;
}

/** Досоздание отсутствующих справочников */
export const useSeedCatalog = () => {
    const queryClient = useQueryClient();

    return useMutation<TableImportReportDto[], Error, SeedInput>({
        mutationFn: ({ sections, dryRun }) => helper.seed(sections, dryRun),
        onSuccess: (_reports, { dryRun }) => {
            if (dryRun) return;
            for (const key of AFFECTED_QUERY_KEYS) {
                queryClient.invalidateQueries({ queryKey: [key] });
            }
        },
    });
};

/** Текст ошибки запроса в понятном виде */
export const errorMessage = (error: Error | null): string | null => {
    if (!error) return null;
    const withResponse = error as Error & {
        response?: { data?: { message?: string | string[] } };
    };
    const message = withResponse.response?.data?.message;
    if (Array.isArray(message)) return message.join('; ');
    return message ?? error.message;
};

/**
 * Состояние одной таблицы на странице: выбранный файл, результат
 * проверки и признак того, что проверка относится именно к этому файлу.
 */
export const useTableImportState = (kind: CatalogTableKind) => {
    const exportTable = useExportCatalogTable();
    const importTable = useImportCatalogTable();
    const [file, setFile] = React.useState<File | null>(null);
    const [reports, setReports] = React.useState<
        TableImportReportDto[] | null
    >(null);
    const [checkedFileName, setCheckedFileName] = React.useState<string | null>(
        null,
    );
    const [applied, setApplied] = React.useState(false);

    const selectFile = (next: File | null): void => {
        setFile(next);
        setReports(null);
        setCheckedFileName(null);
        setApplied(false);
        importTable.reset();
    };

    const run = async (dryRun: boolean): Promise<void> => {
        if (!file) return;
        const result = await importTable.mutateAsync({ kind, file, dryRun });
        setReports(result);
        setCheckedFileName(file.name);
        setApplied(!dryRun);
    };

    return {
        exportTable,
        importTable,
        file,
        reports,
        /** Проверка сделана для выбранного сейчас файла */
        isChecked: checkedFileName !== null && checkedFileName === file?.name,
        applied,
        selectFile,
        check: () => run(true),
        apply: () => run(false),
        error: errorMessage(importTable.error),
    };
};
