'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AiEntity } from '../../model';
import {
    useAi,
    useAiByDomain,
    useAiByDomainAndUser,
    useAiFilter
} from '../../lib/hooks';
import { AiTable } from '../ai-table/AiTable';
import { AiFilter } from './components/AiFilter';
import { AI_PATH } from '../../consts/ai.consts';

interface AiListProps {
    domain?: string;
    userId?: string;
    basePath?: string; // Базовый путь для навигации (для портала или общей страницы)
}

export function AiList({ domain, userId, basePath }: AiListProps) {
    const router = useRouter();

    // Используем соответствующий хук в зависимости от параметров
    const allAi = useAi();
    const domainAi = useAiByDomain(domain || '');
    const domainAndUserAi = useAiByDomainAndUser(domain || '', userId || '');

    // Определяем, какой источник данных использовать
    let aiEntities: AiEntity[] | undefined;
    let isLoading: boolean;

    if (domain && userId) {
        aiEntities = domainAndUserAi.data;
        isLoading = domainAndUserAi.isLoading;
    } else if (domain) {
        aiEntities = domainAi.data;
        isLoading = domainAi.isLoading;
    } else {
        aiEntities = allAi.data;
        isLoading = allAi.isLoading;
    }

    const { filters, setFilters, filteredAiEntities, filterOptions } = useAiFilter(aiEntities);

    // Определяем путь для навигации
    const navigationPath = basePath || AI_PATH;

    const handleRowClick = (ai: AiEntity) => {
        router.push(`${navigationPath}/${ai.id}`);
    };

    return (
        <div className="space-y-4 w-full max-w-full min-w-0">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">
                    AI записи
                    {domain && <span className="text-lg text-muted-foreground ml-2">({domain})</span>}
                    {userId && <span className="text-lg text-muted-foreground ml-2">- {userId}</span>}
                </h1>
            </div>

            <AiFilter
                filters={filters}
                onFiltersChange={setFilters}
                filterOptions={filterOptions}
            />

            <div className="w-full max-w-full min-w-0 overflow-x-auto">
                <AiTable
                    data={filteredAiEntities}
                    isLoading={isLoading}
                    onRowClick={handleRowClick}
                />
            </div>
        </div>
    );
}
