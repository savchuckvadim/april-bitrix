'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { OWNER_REPORT_EXPORT_POLL_MS } from '../../consts/owner-report-export.const';
import {
    OwnerReportExportHelper,
    type OwnerReportExportTarget,
} from '../api/owner-report-export-helper';

export const ownerReportExportHelper = new OwnerReportExportHelper();
const KEY = ['owner-report-export'] as const;

const keyOf = (target: OwnerReportExportTarget | null) => [
    ...KEY,
    target?.domain ?? '',
    target?.periodKey ?? '',
];

/** Состояние выгрузки периода; опрос — пока PDF в очереди или собирается. */
export const useOwnerReportExportState = (
    target: OwnerReportExportTarget | null,
) =>
    useQuery({
        queryKey: keyOf(target),
        queryFn: () =>
            ownerReportExportHelper.state(target as OwnerReportExportTarget),
        enabled: !!target,
        refetchInterval: query => {
            const status = query.state.data?.status;
            return status === 'queued' || status === 'processing'
                ? OWNER_REPORT_EXPORT_POLL_MS
                : false;
        },
        refetchIntervalInBackground: false,
        retry: false,
    });

/** «Сформировать PDF»: ставит выгрузку и кладёт ответ в кэш состояния. */
export const useStartOwnerReportExport = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({
            target,
            forceRefresh,
        }: {
            target: OwnerReportExportTarget;
            forceRefresh: boolean;
        }) => ownerReportExportHelper.start(target, forceRefresh),
        onSuccess: (state, { target }) => {
            qc.setQueryData(keyOf(target), state);
        },
    });
};

/** Имя файла как у сервера: домен, вид и период. */
export const ownerReportFileName = (target: OwnerReportExportTarget): string =>
    `${target.domain}-sales-report-month-${target.periodKey}.pdf`;

/** Скачать Blob файлом в браузере. */
export function saveBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}
