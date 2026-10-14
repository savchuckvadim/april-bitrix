'use client';

import { useMemo } from 'react';
import {
    DIGEST_TABLE_METRICS,
    buildDigestRatingDataset,
} from '@/modules/entities/digest';
import { useDigestData } from '../../lib/digest-data.context';
import { buildComparison, buildRatingBoards } from '../lib/ratings.util';

/** Доски top-N, датасет для графика победителей, сравнение сотрудника в фокусе. */
export const useDigestRatings = () => {
    const { rows, averages, sections, groupSections, focusRow } = useDigestData();

    const boards = useMemo(() => buildRatingBoards(rows, averages), [rows, averages]);
    const dataset = useMemo(
        () => buildDigestRatingDataset(rows, DIGEST_TABLE_METRICS),
        [rows],
    );
    const comparison = useMemo(
        () => buildComparison(focusRow, averages, sections),
        [focusRow, averages, sections],
    );

    return {
        boards,
        dataset,
        comparison,
        departmentSections: sections.length > 1 ? sections : null,
        groupSections: groupSections.length > 1 ? groupSections : null,
        hasRating: rows.length > 1,
    };
};
