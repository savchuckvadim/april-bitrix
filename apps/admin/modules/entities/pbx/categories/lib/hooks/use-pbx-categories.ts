'use client';

import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type {
    PbxCategoryCompareRow,
    PbxTemplateCategory,
} from '../../../lib/model/common';
import { getApiErrorMessage } from '../../../lib/api-error';
import type { PbxCategoriesAdapter } from '../../model';
import {
    buildCategoryCompareRows,
    toInstalledCategories,
    toTemplateCategories,
} from '../utils/merge-categories';

export interface UsePbxCategoriesOptions {
    domain?: string;
    group: string;
    variant: string;
    search: string;
}

/** Reusable controller for funnel (category) + nested stage management. */
export function usePbxCategories(
    adapter: PbxCategoriesAdapter,
    opts: UsePbxCategoriesOptions,
) {
    const queryClient = useQueryClient();
    const { domain, group, variant, search } = opts;

    const api = useMemo(
        () => adapter.create({ group, variant }),
        [adapter, group, variant],
    );
    const base = useMemo(() => ['pbx-categories', adapter.key], [adapter.key]);
    const searchActive = search.trim().length > 0;

    const monitoringQuery = useQuery({
        queryKey: [...base, 'monitoring', domain, group, variant],
        queryFn: () => api.getMonitoringData(domain as string),
        enabled: !!domain,
    });

    const templateQuery = useQuery({
        queryKey: [...base, 'template', group, variant],
        queryFn: () => api.getTemplateCategories(),
    });

    const invalidate = () => queryClient.invalidateQueries({ queryKey: base });
    const onError = (e: unknown) => toast.error(getApiErrorMessage(e));
    // Mutation `onSuccess` that both confirms via toast and refreshes the table.
    const onDone = (message: string) => () => {
        toast.success(message);
        invalidate();
    };

    const installTemplate = useMutation({
        mutationFn: () => api.installFromTemplate(domain as string),
        onSuccess: onDone('Шаблон воронок установлен'),
        onError,
    });
    const installCategories = useMutation({
        mutationFn: (categories: PbxTemplateCategory[]) =>
            api.installCategories(domain as string, categories),
        onSuccess: onDone('Воронки синхронизированы'),
        onError,
    });
    const deleteCategories = useMutation({
        mutationFn: (vars: { domain: string; codes: string[] }) =>
            api.deleteCategories!(vars.domain, vars.codes),
        onSuccess: onDone('Воронка удалена'),
        onError,
    });
    const deleteStage = useMutation({
        mutationFn: (vars: {
            domain: string;
            categoryCode: string;
            stageCode: string;
        }) => api.deleteStage(vars.domain, vars.categoryCode, vars.stageCode),
        onSuccess: onDone('Стадия удалена'),
        onError,
    });
    const editStage = useMutation({
        mutationFn: (vars: {
            domain: string;
            categoryCode: string;
            stageCode: string;
            newValue: string;
        }) =>
            api.editStage(
                vars.domain,
                vars.categoryCode,
                vars.stageCode,
                vars.newValue,
            ),
        onSuccess: onDone('Стадия изменена'),
        onError,
    });

    const allRows = useMemo<PbxCategoryCompareRow[]>(
        () =>
            buildCategoryCompareRows(
                toTemplateCategories(templateQuery.data),
                toInstalledCategories(monitoringQuery.data),
            ),
        [templateQuery.data, monitoringQuery.data],
    );

    // Client-side filter over the loaded compare rows — matches category
    // code / name and any nested stage code / name; keeps the full compare view.
    const rows = useMemo<PbxCategoryCompareRow[]>(() => {
        if (!searchActive) return allRows;
        const q = search.trim().toLowerCase();
        const has = (v: unknown) => String(v ?? '').toLowerCase().includes(q);
        return allRows.filter((r) => {
            if (has(r.code) || has(r.name)) return true;
            return r.stages.some((s) => has(s.code) || has(s.name));
        });
    }, [allRows, search, searchActive]);

    const isLoading = templateQuery.isLoading || monitoringQuery.isLoading;

    return {
        rows,
        isLoading,
        searchActive,
        installTemplate,
        installCategories,
        deleteCategories,
        deleteStage,
        editStage,
    };
}
