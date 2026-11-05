'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AiEntity } from '../../model';
import {
    useAiByDomainAndUser,
    useAiFilter,
    useAiPage,
} from '../../lib/hooks';
import { AiPager } from './components/AiPager';
import { AiTable } from '../ai-table/AiTable';
import { AiFilter } from './components/AiFilter';
import { AI_PATH } from '../../consts/ai.consts';

interface AiListProps {
    domain?: string;
    userId?: string;
    basePath?: string; // Базовый путь для навигации (для портала или общей страницы)
}

/** Записей на странице списка. */
const AI_LIST_PAGE_SIZE = 50;

export function AiList({ domain, userId, basePath }: AiListProps) {
    const router = useRouter();
    const [page, setPage] = React.useState(1);
    const byUser = Boolean(domain && userId);
    // Другой портал — с первой страницы.
    React.useEffect(() => setPage(1), [domain]);

    // Все записи и все записи портала — постранично с сервера (выгрузка
    // целиком вешала вкладку); по сотруднику записей немного — как было.
    const paged = useAiPage(
        { page, pageSize: AI_LIST_PAGE_SIZE, ...(domain ? { domain } : {}) },
        !byUser,
    );
    const domainAndUserAi = useAiByDomainAndUser(domain || '', userId || '');

    const aiEntities: AiEntity[] | undefined = byUser
        ? domainAndUserAi.data
        : paged.data?.items;
    const isLoading = byUser ? domainAndUserAi.isLoading : paged.isLoading;

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

            {!byUser && paged.data && (
                <AiPager
                    page={paged.data.page}
                    pageSize={paged.data.pageSize}
                    total={paged.data.total}
                    loading={paged.isFetching}
                    onChange={setPage}
                />
            )}

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
