'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ListPager } from '@/modules/shared/ui/list-pager';
import { TranscriptionListFilters, TranscriptionListItem } from '../../model';
import { useTranscriptionFacets, useTranscriptionPage } from '../../lib/hooks';
import { TranscriptionTable } from '../transcription-table/TranscriptionTable';
import { TranscriptionFilter } from './components/TranscriptionFilter';
import {
    TRANSCRIPTION_LIST_PAGE_SIZE,
    TRANSCRIPTION_PATH,
} from '../../consts/transcription.consts';

interface TranscriptionListProps {
    /** Домен портала: список только его транскрипций. */
    domain?: string;
    /** Id сотрудника: только его звонки. */
    userId?: string;
    /** Базовый путь карточки (для портала или общей страницы). */
    basePath?: string;
    /** Что показать справа от заголовка (например, ссылку на расход). */
    headerAction?: React.ReactNode;
}

/**
 * Список транскрипций постранично: фильтры и страницы считает сервер, в
 * браузер приходит одна страница без текстов разговоров.
 */
export function TranscriptionList({ domain, userId, basePath, headerAction }: TranscriptionListProps) {
    const router = useRouter();
    const [page, setPage] = React.useState(1);
    const [filters, setFilters] = React.useState<TranscriptionListFilters>({});

    // Другой портал или сотрудник — фильтры и страница сначала.
    React.useEffect(() => {
        setFilters({});
        setPage(1);
    }, [domain, userId]);

    const params = {
        ...filters,
        ...(domain ? { domain } : {}),
        ...(userId ? { userId } : {}),
        page,
        pageSize: TRANSCRIPTION_LIST_PAGE_SIZE,
    };
    const list = useTranscriptionPage(params);
    const facets = useTranscriptionFacets(domain);

    const changeFilters = (next: TranscriptionListFilters) => {
        setFilters(next);
        setPage(1);
    };

    const navigationPath = basePath || TRANSCRIPTION_PATH;
    const handleRowClick = (item: TranscriptionListItem) => {
        router.push(`${navigationPath}/${item.id}`);
    };

    return (
        <div className="w-full min-w-0 max-w-full space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-3xl font-bold">
                    Транскрипции
                    {domain && <span className="ml-2 text-lg text-muted-foreground">({domain})</span>}
                    {userId && <span className="ml-2 text-lg text-muted-foreground">— сотрудник {userId}</span>}
                </h1>
                {headerAction}
            </div>

            <TranscriptionFilter
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
                <TranscriptionTable
                    data={list.data?.items ?? []}
                    isLoading={list.isLoading}
                    hideDomain={Boolean(domain)}
                    onRowClick={handleRowClick}
                />
            </div>
        </div>
    );
}
