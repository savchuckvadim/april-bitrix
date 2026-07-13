'use client';

import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type {
    PbxFieldCompareRow,
    PbxTemplateField,
} from '../../../lib/model/common';
import { getApiErrorMessage } from '../../../lib/api-error';
import type { PbxFieldsAdapter } from '../../model';
import {
    buildFieldCompareRows,
    toNormalizedFields,
    toTemplateFields,
} from '../utils/merge-fields';

export interface UsePbxFieldsOptions {
    domain?: string;
    group: string;
    variant: string;
    search: string;
    /** Filter rows to a single field type; `'all'`/empty disables it. */
    typeFilter?: string;
}

/** Sentinel for the "all types" option of the type filter. */
export const ALL_FIELD_TYPES = 'all';

/**
 * Reusable controller for any field-owning pbx entity. Binds the adapter to the
 * current scope (group + variant) and wires its operations to react-query.
 */
export function usePbxFields(adapter: PbxFieldsAdapter, opts: UsePbxFieldsOptions) {
    const queryClient = useQueryClient();
    const { domain, group, variant, search, typeFilter } = opts;
    const caps = adapter.capabilities;

    const api = useMemo(
        () => adapter.create({ group, variant }),
        [adapter, group, variant],
    );
    const base = useMemo(() => ['pbx-fields', adapter.key], [adapter.key]);
    const searchActive = search.trim().length > 0;

    const monitoringQuery = useQuery({
        queryKey: [...base, 'monitoring', domain, group, variant],
        queryFn: () => api.getMonitoringData!(domain as string),
        enabled: !!domain && caps.monitoring && !!api.getMonitoringData,
    });

    const templateQuery = useQuery({
        queryKey: [...base, 'template', domain, group, variant],
        queryFn: () => api.getTemplateFields!(domain),
        enabled: caps.template && !!api.getTemplateFields && !!domain,
    });

    const invalidate = () => queryClient.invalidateQueries({ queryKey: base });
    const onError = (e: unknown) => toast.error(getApiErrorMessage(e));
    // Mutation `onSuccess` that both confirms via toast and refreshes the table.
    const onDone = (message: string) => () => {
        toast.success(message);
        invalidate();
    };

    const installTemplate = useMutation({
        mutationFn: () => api.installFromTemplate!(domain as string),
        onSuccess: onDone('Шаблон полей установлен'),
        onError,
    });
    const installConstants = useMutation({
        mutationFn: () => api.installFromConstants!(domain as string),
        onSuccess: onDone('Поля из констант установлены'),
        onError,
    });
    const installFields = useMutation({
        mutationFn: (fields: PbxTemplateField[]) =>
            api.installFields(domain as string, fields),
        onSuccess: onDone('Поля синхронизированы'),
        onError,
    });
    const deleteFields = useMutation({
        mutationFn: (vars: { domain: string; codes: string[] }) =>
            api.deleteFields(vars.domain, vars.codes),
        onSuccess: onDone('Поля удалены'),
        onError,
    });
    const deleteFieldItem = useMutation({
        mutationFn: (vars: {
            domain: string;
            fieldCode: string;
            itemCode: string;
        }) => api.deleteFieldItem!(vars.domain, vars.fieldCode, vars.itemCode),
        onSuccess: onDone('Значение списка удалено'),
        onError,
    });
    const editFieldItem = useMutation({
        mutationFn: (vars: {
            domain: string;
            fieldCode: string;
            itemCode: string;
            newValue: string;
        }) =>
            api.editFieldItem!(
                vars.domain,
                vars.fieldCode,
                vars.itemCode,
                vars.newValue,
            ),
        onSuccess: onDone('Значение списка изменено'),
        onError,
    });

    const allRows = useMemo<PbxFieldCompareRow[]>(
        () => {
            // TEMP DEBUG: trace where the PortalDB side of a field is lost.
            // Remove once the concurents_multiple issue is resolved.
            const RE = /concurents/i;
            const raw = monitoringQuery.data as unknown as
                | import('../../../lib/model/common').PbxFieldsMonitoringData
                | undefined;
            // eslint-disable-next-line no-console
            console.log('[pbx-debug] monitoring raw', raw);
            if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
                // eslint-disable-next-line no-console
                console.log(
                    '[pbx-debug] merged match',
                    raw.mergedFields?.filter(
                        (m) =>
                            RE.test(m?.name ?? '') ||
                            RE.test((m?.p as { code?: string })?.code ?? '') ||
                            RE.test(
                                (m?.bx as { FIELD_NAME?: string; fieldName?: string })
                                    ?.FIELD_NAME ??
                                    (m?.bx as { fieldName?: string })?.fieldName ??
                                    '',
                            ),
                    ),
                    'portalWithoutMerged match',
                    raw.portalFieldsWithoutMerged?.filter((p) =>
                        RE.test((p as { code?: string })?.code ?? ''),
                    ),
                );
            }
            const normalized = toNormalizedFields(monitoringQuery.data);
            // eslint-disable-next-line no-console
            console.log(
                '[pbx-debug] normalized match',
                normalized.filter(
                    (f) => RE.test(f.code) || RE.test(f.bitrixName ?? ''),
                ),
            );
            return buildFieldCompareRows(
                toTemplateFields(templateQuery.data),
                normalized,
            );
        },
        [templateQuery.data, monitoringQuery.data],
    );

    // Distinct field types present in the loaded rows — drives the type filter.
    const availableTypes = useMemo<string[]>(() => {
        const set = new Set<string>();
        for (const r of allRows) if (r.type) set.add(r.type);
        return Array.from(set).sort((a, b) => a.localeCompare(b));
    }, [allRows]);

    const typeActive = Boolean(typeFilter && typeFilter !== ALL_FIELD_TYPES);

    // Client-side filter over the already-loaded compare rows — keeps the full
    // template ↔ Bitrix ↔ PortalDB view and matches code / name / type / enum items,
    // then narrows to a single type when the type filter is set.
    const rows = useMemo<PbxFieldCompareRow[]>(() => {
        let result = allRows;
        if (searchActive) {
            const q = search.trim().toLowerCase();
            const has = (v: unknown) =>
                String(v ?? '').toLowerCase().includes(q);
            result = result.filter((r) => {
                if (has(r.code) || has(r.name) || has(r.type)) return true;
                return r.items.some((it) => has(it.code) || has(it.name));
            });
        }
        if (typeActive) {
            result = result.filter((r) => r.type === typeFilter);
        }
        return result;
    }, [allRows, search, searchActive, typeFilter, typeActive]);

    const isLoading = templateQuery.isLoading || monitoringQuery.isLoading;

    return {
        rows,
        availableTypes,
        isLoading,
        searchActive: searchActive || typeActive,
        installTemplate,
        installConstants,
        installFields,
        deleteFields,
        deleteFieldItem,
        editFieldItem,
    };
}
