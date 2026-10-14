'use client';

import { useMemo } from 'react';
import { sumRows } from '@/modules/entities/digest';
import { useDigestData } from '../../lib/digest-data.context';
import { buildSummaryTiles } from '../lib/summary-tiles.util';

/** Плитки итогов по видимым строкам (фокус — один сотрудник). */
export const useDigestSummary = () => {
    const { visibleRows, focusRow } = useDigestData();
    const tiles = useMemo(() => buildSummaryTiles(sumRows(visibleRows)), [visibleRows]);
    return {
        tiles,
        scopeLabel: focusRow ? focusRow.name : `сотрудников: ${visibleRows.length}`,
    };
};
