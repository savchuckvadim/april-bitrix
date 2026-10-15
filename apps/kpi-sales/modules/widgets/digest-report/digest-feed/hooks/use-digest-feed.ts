'use client';

import { useEffect, useMemo, useState } from 'react';
import { useDigestData } from '../../lib/digest-data.context';
import { catalogNames, type NameMap } from '../../lib/catalog-names.util';
import {
    buildFeedGroups,
    FEED_PAGE_SIZE,
    FEED_TYPE_ALL,
    feedRecordsCount,
    filterFeedItems,
    mergeFeedItems,
    summarizeItems,
    typeOptionsOf,
    type FeedGroup,
    type FeedStackFilter,
} from '../lib/digest-feed.util';

/** Группы ленты по всем сотрудникам выборки + справочники и данные для ссылок. */
export const useDigestFeed = () => {
    const { rows, report, domain, focusRow } = useDigestData();
    const groups = useMemo(() => buildFeedGroups(rows), [rows]);
    const names = useMemo(() => catalogNames(report.catalog), [report.catalog]);
    return {
        groups,
        presentUserIds: groups.map(group => group.userId),
        total: feedRecordsCount(groups),
        names,
        domain,
        listId: report.listId,
        focusUserId: focusRow?.userId ?? null,
    };
};

export type FeedSelection = 'all' | number;

/**
 * Секция ленты (сводная / отдел / группа): выбранный сотрудник или «Все»
 * (общая хронология), фильтры по исходу и типу, порционный показ. Фокус
 * из таблицы переключает выбор на этого сотрудника.
 */
export const useDigestFeedSection = (
    allGroups: readonly FeedGroup[],
    typeNames: NameMap,
    userIds?: ReadonlySet<number>,
    focusUserId: number | null = null,
) => {
    const groups = useMemo(
        () => (userIds ? allGroups.filter(group => userIds.has(group.userId)) : [...allGroups]),
        [allGroups, userIds],
    );
    const [selection, setSelection] = useState<FeedSelection>(focusUserId ?? 'all');
    const [stack, setStack] = useState<FeedStackFilter>('all');
    const [typeCode, setTypeCode] = useState<string>(FEED_TYPE_ALL);
    const [visibleCount, setVisibleCount] = useState(FEED_PAGE_SIZE);

    useEffect(() => {
        setSelection(focusUserId ?? 'all');
        setVisibleCount(FEED_PAGE_SIZE);
    }, [focusUserId]);

    // Выбранного нет в секции (другой отдел) — показываем всех.
    const effective: FeedSelection =
        selection !== 'all' && !groups.some(group => group.userId === selection)
            ? 'all'
            : selection;

    const baseItems = useMemo(
        () =>
            effective === 'all'
                ? mergeFeedItems(groups)
                : (groups.find(group => group.userId === effective)?.items ?? []),
        [groups, effective],
    );
    const typeOptions = useMemo(() => typeOptionsOf(baseItems, typeNames), [baseItems, typeNames]);
    const items = useMemo(
        () => filterFeedItems(baseItems, stack, typeCode),
        [baseItems, stack, typeCode],
    );
    const allSummary = useMemo(() => summarizeItems(mergeFeedItems(groups)), [groups]);

    const select = (next: FeedSelection) => {
        setSelection(next);
        setVisibleCount(FEED_PAGE_SIZE);
    };
    const changeStack = (value: string) => {
        setStack(value as FeedStackFilter);
        setVisibleCount(FEED_PAGE_SIZE);
    };
    const changeType = (value: string) => {
        setTypeCode(value);
        setVisibleCount(FEED_PAGE_SIZE);
    };
    const showMore = () => setVisibleCount(count => count + FEED_PAGE_SIZE);

    return {
        groups,
        selection: effective,
        select,
        stack,
        changeStack,
        typeCode,
        changeType,
        typeOptions,
        items,
        /** Записей до фильтров у выбранного сотрудника или у всех. */
        baseTotal: baseItems.length,
        visibleItems: items.slice(0, visibleCount),
        hasMore: items.length > visibleCount,
        allSummary,
        showMore,
        /** В общей хронологии нескольких сотрудников подписываем автора записи. */
        showEmployeeName: effective === 'all' && groups.length > 1,
    };
};
