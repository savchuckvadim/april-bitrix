'use client';

import * as React from 'react';
import { BlurCommitInput } from '@workspace/april-ui/fields';
import { Label } from '@workspace/ui/components/label';
import type { AiAdminFacetsDto } from '@workspace/nest-admin-api';
import { FacetCombobox } from '@/modules/shared/ui/list-pager';
import type { AiListFilters } from '../../../model';

interface AiFilterProps {
    filters: AiListFilters;
    onFiltersChange: (filters: AiListFilters) => void;
    facets: AiAdminFacetsDto | undefined;
    /** Список одного портала — выбор портала не показывается. */
    hideDomain?: boolean;
}

/**
 * Фильтры списка AI-записей. Всё считает сервер: значения — из базы с
 * числом записей, поиск уходит по Enter или уходу из поля.
 */
export function AiFilter({ filters, onFiltersChange, facets, hideDomain }: AiFilterProps) {
    const set = (patch: Partial<AiListFilters>) => onFiltersChange({ ...filters, ...patch });

    return (
        <div className="grid gap-3 rounded-xl border p-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-1 md:col-span-2">
                <Label>Поиск</Label>
                <BlurCommitInput
                    value={filters.search ?? ''}
                    onCommit={value => set({ search: value.trim() || undefined })}
                    placeholder="Сотрудник, сделка, id сделки или дела — Enter"
                />
            </div>
            {!hideDomain && (
                <FacetCombobox
                    label="Портал"
                    facets={facets?.domains}
                    value={filters.domain}
                    onChange={domain => set({ domain })}
                />
            )}
            <FacetCombobox
                label="Тип записи"
                facets={facets?.types}
                value={filters.type}
                onChange={type => set({ type })}
            />
            <FacetCombobox
                label="Поставщик модели"
                facets={facets?.providers}
                value={filters.provider}
                onChange={provider => set({ provider })}
            />
            <FacetCombobox
                label="Статус"
                facets={facets?.statuses}
                value={filters.status}
                onChange={status => set({ status })}
            />
        </div>
    );
}
