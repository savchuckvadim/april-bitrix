'use client';

import { useCallback, useMemo, useState } from 'react';
import { useAppDispatch } from '@/modules/app/lib/hooks/redux';
import { digestActions, sumRows, type DigestRow } from '@/modules/entities/digest';
import { useDigestData } from '../../lib/digest-data.context';
import { catalogNames } from '../../lib/catalog-names.util';
import {
    DEFAULT_DIGEST_SORT,
    nextSort,
    sortDigestRows,
    type DigestSort,
    type DigestSortKey,
} from '../lib/digest-table.util';

/** Сортировка, имена справочников, фокус по клику на сотрудника. */
export const useDigestTable = () => {
    const dispatch = useAppDispatch();
    const { rows, report, focusUserId } = useDigestData();
    const [sort, setSort] = useState<DigestSort>(DEFAULT_DIGEST_SORT);

    const names = useMemo(() => catalogNames(report.catalog), [report.catalog]);
    const toggleSort = useCallback(
        (key: DigestSortKey) => setSort(current => nextSort(current, key)),
        [],
    );
    const toggleFocus = useCallback(
        (userId: number) => dispatch(digestActions.setFocusUser(userId)),
        [dispatch],
    );
    const sortedRowsOf = useCallback(
        (subset: readonly DigestRow[]) => sortDigestRows(subset, sort),
        [sort],
    );
    const totalsOf = useCallback((subset: readonly DigestRow[]) => sumRows(subset), []);

    return {
        rows,
        presentUserIds: rows.map(row => row.userId),
        sort,
        toggleSort,
        names,
        focusUserId,
        toggleFocus,
        sortedRowsOf,
        totalsOf,
    };
};
