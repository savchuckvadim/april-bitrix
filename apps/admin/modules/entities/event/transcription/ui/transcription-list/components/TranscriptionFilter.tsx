'use client';

import * as React from 'react';
import { BlurCommitInput } from '@workspace/april-ui/fields';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import type { TranscriptionAdminFacetsDto } from '@workspace/nest-admin-api';
import { FacetCombobox } from '@/modules/shared/ui/list-pager';
import type { TranscriptionListFilters } from '../../../model';
import {
    transcriptionProviderLabel,
    transcriptionStatusLabel,
} from '../../../lib/transcription-labels';

interface TranscriptionFilterProps {
    filters: TranscriptionListFilters;
    onFiltersChange: (filters: TranscriptionListFilters) => void;
    facets: TranscriptionAdminFacetsDto | undefined;
    /** Список одного портала — выбор портала не показывается. */
    hideDomain?: boolean;
}

/**
 * Фильтры списка транскрипций. Всё считает сервер: значения — из базы с
 * числом записей, поиск уходит по Enter или уходу из поля.
 */
export function TranscriptionFilter({
    filters,
    onFiltersChange,
    facets,
    hideDomain,
}: TranscriptionFilterProps) {
    const set = (patch: Partial<TranscriptionListFilters>) =>
        onFiltersChange({ ...filters, ...patch });

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
                label="Распознаватель"
                facets={facets?.providers}
                value={filters.provider}
                onChange={provider => set({ provider })}
                labelOf={transcriptionProviderLabel}
            />
            <FacetCombobox
                label="Статус"
                facets={facets?.statuses}
                value={filters.status}
                onChange={status => set({ status })}
                labelOf={transcriptionStatusLabel}
            />
            <FacetCombobox
                label="Приложение"
                facets={facets?.apps}
                value={filters.app}
                onChange={app => set({ app })}
            />
            <div className="space-y-1">
                <Label>С дня</Label>
                <Input
                    type="date"
                    value={filters.dateFrom ?? ''}
                    onChange={event => set({ dateFrom: event.target.value || undefined })}
                />
            </div>
            <div className="space-y-1">
                <Label>По день</Label>
                <Input
                    type="date"
                    value={filters.dateTo ?? ''}
                    onChange={event => set({ dateTo: event.target.value || undefined })}
                />
            </div>
        </div>
    );
}
