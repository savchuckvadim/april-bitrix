'use client';

import { useEffect } from 'react';
import { callsListOverflowPage } from '@/modules/entities/calls-list';
import { useCallsListData } from '../hooks/use-calls-list-data';
import { useCallsListQuery } from '../hooks/use-calls-list-query';
import { CallsListContent } from './CallsListContent';
import { CallsListFilters } from './CallsListFilters';
import { CallsListTopBar } from './CallsListTopBar';

/**
 * Раздел «Разборы звонков» — отдельная страница приложения на всю ширину,
 * без обвязки отчёта: строка «← AI-аналитика · Разборы звонков», фильтры
 * одной строкой, таблица и страницы (считает сервер). Фильтры и страница —
 * в адресе; открыть разбор — ссылкой строки. Только руководителям и
 * суперпользователю (иначе бэк отвечает 403 — «Раздел доступен
 * руководителям»).
 */
export const CallsListPage = () => {
    const list = useCallsListQuery();
    const periodInvalid = list.periodProblem !== null;
    const result = useCallsListData(list.query, !periodInvalid);
    const { data, loading } = result;
    const { query, update } = list;

    // Страница за последней (старый адрес, фильтры сузились) — на последнюю.
    useEffect(() => {
        if (loading || data === null) return;
        const last = callsListOverflowPage(query, {
            total: data.total,
            itemsCount: data.items.length,
        });
        if (last !== null) update({ page: last });
    }, [loading, data, query, update]);

    return (
        <div className="space-y-3">
            <CallsListTopBar total={data && !periodInvalid ? data.total : null} />
            <CallsListFilters
                query={query}
                facets={data?.facets ?? null}
                periodProblem={list.periodProblem}
                filtered={list.filtered}
                onChange={update}
                onReset={list.reset}
            />
            <CallsListContent
                query={query}
                data={data}
                loading={loading}
                error={result.error}
                periodInvalid={periodInvalid}
                filtered={list.filtered}
                onChange={update}
                onReset={list.reset}
                onRetry={result.retry}
            />
        </div>
    );
};
