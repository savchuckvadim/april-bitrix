'use client';

import { useCallback, useMemo, useState } from 'react';
import {
    AI_MATRIX_TEXT,
    AI_TYPE_COUNT_SUFFIX,
    AI_TYPES_MATRIX_DEFAULT_MODE,
    aiMatrixVisibleTypes,
    aiTypesBackendTotals,
    aiTypesMatrixColumns,
    buildAiMatrixCountDataset,
    buildAiMatrixCsvRows,
    buildAiMatrixScorePoints,
    buildAiMatrixTotalsTable,
    buildAiTypesMatrixFor,
    isAiTypesMatrixMode,
    parseAiHiddenTypes,
    serializeAiHiddenTypes,
    toggleAiHiddenType,
} from '@/modules/entities/ai-analytics';
import { downloadCsvRows } from '@/modules/entities/report';
import { usePersistedSelection } from '@/modules/shared';
import { aiTypesColumnHints } from '../lib/ai-matrix-hints.util';
import { aiMatrixLegend } from '../lib/ai-matrix-legend.util';
import {
    AI_TYPES_MATRIX_HIDDEN_KEY,
    AI_TYPES_MATRIX_MODE_KEY,
    aiMatrixPresentUserIds,
    aiMatrixScoreIndicators,
    buildAiTypeChips,
} from '../lib/ai-types-matrix-view.util';
import { useAiMatrixContext, useAiMatrixCoverage } from './use-ai-matrix-context';
import { useAiTypesDrawer } from './use-ai-types-drawer';
import { useAiTypesMatrixSource } from './use-ai-types-matrix-source';

const CSV_FILENAME = 'ai-types-matrix.csv';

/**
 * Блок «AI: типы звонков»: менеджер × корзина (по умолчанию) или тип —
 * оценка крупно, разборов мелко, цвет относительно «Итого по отделу».
 * Чипы-фильтр скрытых типов и вид колонок живут в localStorage; скрытые
 * типы исключены из таблицы, корзин, CSV и рейтингов. Сотрудники без
 * разборов скрыты, пока не нажали «показать». buildTable(userIds) —
 * таблица секции «По отделам / По группам» со своим итогом.
 */
export const useAiTypesMatrix = () => {
    const { section, rows, totalsByType, coverage, callTypes, presentTypes, managerName } =
        useAiTypesMatrixSource();
    const ctx = useAiMatrixContext();
    const coverageView = useAiMatrixCoverage(ctx, coverage);
    const { openWithType } = useAiTypesDrawer();
    const [hiddenRaw, setHiddenRaw] = usePersistedSelection(AI_TYPES_MATRIX_HIDDEN_KEY);
    const [modeRaw, setModeRaw] = usePersistedSelection(AI_TYPES_MATRIX_MODE_KEY);
    const [showHidden, setShowHidden] = useState(false);

    const mode = isAiTypesMatrixMode(modeRaw) ? modeRaw : AI_TYPES_MATRIX_DEFAULT_MODE;
    const hiddenTypes = useMemo(() => parseAiHiddenTypes(hiddenRaw), [hiddenRaw]);
    const visibleTypes = useMemo(
        () => aiMatrixVisibleTypes(presentTypes, hiddenTypes),
        [presentTypes, hiddenTypes],
    );
    const chips = useMemo(
        () => buildAiTypeChips(presentTypes, hiddenTypes, callTypes),
        [presentTypes, hiddenTypes, callTypes],
    );
    const columns = useMemo(
        () => aiTypesMatrixColumns(visibleTypes, mode, callTypes),
        [visibleTypes, mode, callTypes],
    );
    const backendTotals = useMemo(
        () => aiTypesBackendTotals(totalsByType, columns, callTypes),
        [totalsByType, columns, callTypes],
    );
    const { comparableFrom } = coverageView;

    const buildTable = useCallback(
        (userIds?: ReadonlySet<number>) =>
            buildAiTypesMatrixFor(rows, visibleTypes, {
                managerName,
                userIds,
                mode,
                callTypes,
                bucketsOf: ctx.bucketsOf,
                comparableFrom,
                onlyWithReviews: !showHidden,
                totals: userIds ? undefined : backendTotals,
            }),
        [rows, visibleTypes, managerName, mode, callTypes, ctx.bucketsOf, comparableFrom, showHidden, backendTotals],
    );
    const buildTotalsRow = useCallback(
        (matrix: ReturnType<typeof buildTable>) =>
            buildAiMatrixTotalsTable(matrix, { comparableFrom }, AI_MATRIX_TEXT.hint.totalsRow),
        [comparableFrom],
    );

    const summaryTable = useMemo(() => buildTable(), [buildTable]);
    const totalsRow = useMemo(() => buildTotalsRow(summaryTable), [buildTotalsRow, summaryTable]);
    const columnHints = useMemo(() => aiTypesColumnHints(columns), [columns]);
    const presentUserIds = useMemo(() => aiMatrixPresentUserIds(rows), [rows]);
    const indicators = useMemo(() => aiMatrixScoreIndicators(columns), [columns]);
    const countDataset = useMemo(
        () => buildAiMatrixCountDataset(summaryTable, AI_TYPE_COUNT_SUFFIX),
        [summaryTable],
    );
    const scorePoints = useMemo(() => buildAiMatrixScorePoints(summaryTable), [summaryTable]);
    const legend = useMemo(() => aiMatrixLegend(coverageView), [coverageView]);

    const toggleType = (code: string) =>
        setHiddenRaw(serializeAiHiddenTypes(toggleAiHiddenType(hiddenTypes, code)));
    const showAllTypes = () => setHiddenRaw('');
    const setMode = (value: string) => {
        if (isAiTypesMatrixMode(value)) setModeRaw(value);
    };
    const toggleHidden = () => setShowHidden(value => !value);
    // Клик по шапке типа — срез по этому типу в drawer; у корзин и продаж действия нет.
    const openColumn = (code: string) => {
        const callType = columns.find(column => column.code === code)?.callType;
        if (callType) openWithType(callType);
    };
    const download = () =>
        downloadCsvRows(
            [
                ...buildAiMatrixCsvRows(summaryTable.table, summaryTable.annotations),
                ...buildAiMatrixCsvRows(totalsRow.table, totalsRow.annotations, undefined, false),
            ],
            CSV_FILENAME,
        );

    const isReady = section.status === 'ready';
    const isEmpty = presentUserIds.length === 0;

    return {
        section,
        isReady,
        isEmpty,
        canDownload: isReady && !isEmpty,
        coverage: coverageView,
        legend,
        mode,
        setMode,
        chips: chips.chips,
        hiddenCount: chips.hiddenCount,
        footnote: chips.footnote,
        toggleType,
        showAllTypes,
        presentUserIds,
        columnHints,
        summaryTable,
        totalsRow,
        hiddenManagers: summaryTable.hiddenUserIds.length,
        showHidden,
        toggleHidden,
        openColumn,
        indicators,
        countDataset,
        scorePoints,
        buildTable,
        buildTotalsRow,
        download,
    };
};
