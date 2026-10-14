'use client';

import { useMemo } from 'react';
import { useDigestData } from '../../lib/digest-data.context';
import { catalogNames } from '../../lib/catalog-names.util';
import { buildFeedGroups, feedRecordsCount } from '../lib/digest-feed.util';

/** Лента дня по видимым сотрудникам + справочники и данные для ссылок. */
export const useDigestFeed = () => {
    const { visibleRows, report, domain, focusRow } = useDigestData();
    const groups = useMemo(() => buildFeedGroups(visibleRows), [visibleRows]);
    const names = useMemo(() => catalogNames(report.catalog), [report.catalog]);
    return {
        groups,
        total: feedRecordsCount(groups),
        names,
        domain,
        listId: report.listId,
        scopeLabel: focusRow ? focusRow.name : 'все сотрудники выборки',
    };
};
