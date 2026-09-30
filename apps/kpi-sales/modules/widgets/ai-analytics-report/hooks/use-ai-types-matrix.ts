'use client';

import { useCallback, useMemo } from 'react';
import {
    aiMatrixVisibleTypes,
    buildAiMatrixCsvRows,
    buildAiTypesCountRatingDataset,
    buildAiTypesMatrixFor,
    buildAiTypesScorePoints,
    parseAiHiddenTypes,
    serializeAiHiddenTypes,
    toggleAiHiddenType,
} from '@/modules/entities/ai-analytics';
import { downloadCsvRows } from '@/modules/entities/report';
import { usePersistedSelection } from '@/modules/shared';
import {
    AI_TYPES_MATRIX_HIDDEN_KEY,
    aiMatrixPresentUserIds,
    aiMatrixVisibleTotals,
    aiTypesScoreIndicators,
    buildAiTypeChips,
} from '../lib/ai-types-matrix-view.util';
import { useAiTypesMatrixSource } from './use-ai-types-matrix-source';

const CSV_FILENAME = 'ai-types-matrix.csv';

/**
 * Блок «AI: типы звонков»: менеджер × тип (разборов + оценка) с хвостом
 * продаж. Чипы-фильтр скрытых типов живут в localStorage (коды через
 * запятую); скрытые типы исключены из таблицы, CSV, итогов и рейтингов.
 * buildTable(userIds) — таблица секции «По отделам / По группам».
 */
export const useAiTypesMatrix = () => {
    const {
        section,
        rows,
        totalsByType,
        callTypes,
        presentTypes,
        managerName,
    } = useAiTypesMatrixSource();
    const [hiddenRaw, setHiddenRaw] = usePersistedSelection(
        AI_TYPES_MATRIX_HIDDEN_KEY,
    );

    const hiddenTypes = useMemo(
        () => parseAiHiddenTypes(hiddenRaw),
        [hiddenRaw],
    );
    const visibleTypes = useMemo(
        () => aiMatrixVisibleTypes(presentTypes, hiddenTypes),
        [presentTypes, hiddenTypes],
    );
    const chips = useMemo(
        () => buildAiTypeChips(presentTypes, hiddenTypes, callTypes),
        [presentTypes, hiddenTypes, callTypes],
    );
    const presentUserIds = useMemo(() => aiMatrixPresentUserIds(rows), [rows]);
    const visibleTotals = useMemo(
        () => aiMatrixVisibleTotals(totalsByType, visibleTypes),
        [totalsByType, visibleTypes],
    );
    const indicators = useMemo(
        () => aiTypesScoreIndicators(visibleTypes),
        [visibleTypes],
    );
    const countDataset = useMemo(
        () => buildAiTypesCountRatingDataset(rows, visibleTypes, managerName),
        [rows, visibleTypes, managerName],
    );
    const scorePoints = useMemo(
        () => buildAiTypesScorePoints(rows, visibleTypes, managerName),
        [rows, visibleTypes, managerName],
    );
    const buildTable = useCallback(
        (userIds?: ReadonlySet<number>) =>
            buildAiTypesMatrixFor(rows, visibleTypes, { managerName, userIds }),
        [rows, visibleTypes, managerName],
    );
    const summaryTable = useMemo(() => buildTable(), [buildTable]);

    const toggleType = (code: string) =>
        setHiddenRaw(
            serializeAiHiddenTypes(toggleAiHiddenType(hiddenTypes, code)),
        );
    const showAllTypes = () => setHiddenRaw('');
    const download = () =>
        downloadCsvRows(
            buildAiMatrixCsvRows(summaryTable.table, summaryTable.annotations),
            CSV_FILENAME,
        );

    const isReady = section.status === 'ready';
    const isEmpty = presentUserIds.length === 0;

    return {
        section,
        isReady,
        isEmpty,
        canDownload: isReady && !isEmpty,
        chips: chips.chips,
        hiddenCount: chips.hiddenCount,
        presentUserIds,
        visibleTotals,
        indicators,
        countDataset,
        scorePoints,
        summaryTable,
        buildTable,
        toggleType,
        showAllTypes,
        download,
    };
};
