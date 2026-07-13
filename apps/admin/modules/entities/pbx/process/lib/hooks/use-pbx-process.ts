'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getApiErrorMessage } from '../../../lib/api-error';
import type { PbxProcessAdapter } from '../../model';

/** Monitoring query + full-install / delete mutations for a process entity. */
export function usePbxProcess(adapter: PbxProcessAdapter, domain?: string) {
    const queryClient = useQueryClient();
    const base = ['pbx-process', adapter.key];

    const monitoring = useQuery({
        queryKey: [...base, domain],
        queryFn: () => adapter.getMonitoring(domain as string),
        enabled: !!domain,
    });

    const invalidate = () => queryClient.invalidateQueries({ queryKey: base });
    const onError = (e: unknown) => toast.error(getApiErrorMessage(e));

    const install = useMutation({
        mutationFn: (vars: { code: string; group: string }) =>
            adapter.install(domain as string, vars.code, vars.group),
        onSuccess: () => {
            toast.success('Процесс установлен');
            invalidate();
        },
        onError,
    });

    const remove = useMutation({
        mutationFn: (vars: { code: string; group: string; withBitrix: boolean }) =>
            adapter.remove(
                domain as string,
                vars.code,
                vars.group,
                vars.withBitrix,
            ),
        onSuccess: () => {
            toast.success('Процесс удалён');
            invalidate();
        },
        onError,
    });

    return { monitoring, install, remove };
}
