'use client';

import { useEffect } from 'react';
import { callsListOverflowPage } from '@/modules/entities/calls-list';
import { useCallsListData } from '../hooks/use-calls-list-data';
import { useCallsListQuery } from '../hooks/use-calls-list-query';
import { useCallsListTypesLock } from '../hooks/use-calls-list-types-lock';
import { hasCallsListBadgeBar } from '../lib/calls-list-badges-view';
import { CallsListBadges } from './CallsListBadges';
import { CallsListContent } from './CallsListContent';
import { CallsListFilters } from './CallsListFilters';
import { CallsListFrame } from './CallsListFrame';

/**
 * Раздел «Разборы звонков» — отдельная страница приложения на всю ширину,
 * без обвязки отчёта: облегчённая шапка с названием и числом разборов, ряд
 * вкладок отчёта («Разборы звонков» среди них активна), фильтры одной строкой,
 * панель бейджей (если сервер её прислал), таблица и страницы (считает
 * сервер). Фильтры, бейджи и страница — в адресе; открыть разбор — ссылкой
 * строки. Только руководителям и суперпользователю (иначе бэк отвечает 403 —
 * «Раздел доступен руководителям»).
 */
export const CallsListPage = () => {
    const list = useCallsListQuery();
    const periodInvalid = list.periodProblem !== null;
    const result = useCallsListData(list.query, !periodInvalid);
    const { data, loading } = result;
    const { query, update } = list;
    const callTypesLock = data?.callTypesLock ?? null;

    useCallsListTypesLock(query.callTypes, callTypesLock, !loading, update);

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
        <CallsListFrame total={data && !periodInvalid ? data.total : null}>
            <div className="space-y-3">
                <CallsListFilters
                    query={query}
                    facets={data?.facets ?? null}
                    callTypesLock={callTypesLock}
                    periodProblem={list.periodProblem}
                    filtered={list.filtered}
                    onChange={update}
                    onReset={list.reset}
                />
                {data && !periodInvalid && hasCallsListBadgeBar(data.facets) && (
                    <CallsListBadges
                        facets={data.facets}
                        query={query}
                        loading={loading}
                        onChange={update}
                    />
                )}
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
        </CallsListFrame>
    );
};
