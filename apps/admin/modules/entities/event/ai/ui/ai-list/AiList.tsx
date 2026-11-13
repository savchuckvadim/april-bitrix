'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ListPager } from '@/modules/shared/ui/list-pager';
import { AiEntity, AiListFilters } from '../../model';
import { useAiFacets, useAiPage } from '../../lib/hooks';
import { AiTable } from '../ai-table/AiTable';
import { AiFilter } from './components/AiFilter';
import { AI_LIST_PAGE_SIZE, AI_PATH } from '../../consts/ai.consts';

interface AiListProps {
    /** Домен портала: только его записи. */
    domain?: string;
    /** Id сотрудника: только его записи. */
    userId?: string;
    /** Базовый путь карточки (для портала или общей страницы). */
    basePath?: string;
}

/**
 * Список AI-записей постранично: фильтры и страницы считает сервер, длинные
 * поля приходят укороченными — запись целиком открывается в карточке.
 */
export function AiList({ domain, userId, basePath }: AiListProps) {
    const router = useRouter();
    const [page, setPage] = React.useState(1);
    const [filters, setFilters] = React.useState<AiListFilters>({});

    // Другой портал или сотрудник — фильтры и страница сначала.
    React.useEffect(() => {
        setFilters({});
        setPage(1);
    }, [domain, userId]);

    const list = useAiPage({
        ...filters,
        ...(domain ? { domain } : {}),
        ...(userId ? { userId } : {}),
        page,
        pageSize: AI_LIST_PAGE_SIZE,
    });
    const facets = useAiFacets(domain);

    const changeFilters = (next: AiListFilters) => {
        setFilters(next);
        setPage(1);
    };

    const navigationPath = basePath || AI_PATH;
    const handleRowClick = (ai: AiEntity) => {
        router.push(`${navigationPath}/${ai.id}`);
    };

    return (
        <div className="w-full min-w-0 max-w-full space-y-4">
            <h1 className="text-3xl font-bold">
                AI-записи
                {domain && <span className="ml-2 text-lg text-muted-foreground">({domain})</span>}
                {userId && <span className="ml-2 text-lg text-muted-foreground">— сотрудник {userId}</span>}
            </h1>

            <AiFilter
                filters={filters}
                onFiltersChange={changeFilters}
                facets={facets.data}
                hideDomain={Boolean(domain)}
            />

            {list.isError && (
                <p className="text-sm text-destructive">Список не загрузился: {list.error.message}</p>
            )}

            {list.data && (
                <ListPager
                    page={list.data.page}
                    pageSize={list.data.pageSize}
                    total={list.data.total}
                    loading={list.isFetching}
                    onChange={setPage}
                />
            )}

            <div className="w-full min-w-0 max-w-full overflow-x-auto">
                <AiTable
                    data={list.data?.items ?? []}
                    isLoading={list.isLoading}
                    onRowClick={handleRowClick}
                />
            </div>
        </div>
    );
}
