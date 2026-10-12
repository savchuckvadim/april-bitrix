'use client';

import { useMutation } from '@tanstack/react-query';
import { SupplyReportTemplateHelper } from '../api/supply-report-template.helper';

const helper = new SupplyReportTemplateHelper();

/** Скачивание .docx: сам шаблон либо заполненный пример (`demo`). */
export const useDownloadSupplyReportTemplate = () =>
    useMutation({
        mutationFn: ({ id, demo }: { id: string; demo?: boolean }) =>
            helper.download(id, demo ?? false),
    });
