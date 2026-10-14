'use client';

import { useMemo } from 'react';
import { useDigestData } from '../../lib/digest-data.context';
import { catalogNames } from '../../lib/catalog-names.util';
import { splitPresentations } from '../lib/digest-presentations.util';

/** Срез презентаций единственного сотрудника в поле зрения; null — нет такого. */
export const useDigestPresentations = () => {
    const { singleRow, report, domain } = useDigestData();
    const names = useMemo(() => catalogNames(report.catalog), [report.catalog]);
    const slices = useMemo(
        () => (singleRow ? splitPresentations(singleRow.employee) : null),
        [singleRow],
    );
    if (!singleRow || !slices) return null;
    const total =
        slices.held.length + slices.notHeld.length + slices.plannedAtStart.length;
    return {
        name: singleRow.name,
        slices,
        total,
        names,
        domain,
        listId: report.listId,
    };
};
