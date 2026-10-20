'use client';

import { useCallback, useMemo, useState } from 'react';
import type { MicroSegmentedOption } from '@workspace/april-ui';
import {
    AI_CALL_TYPE_ALL,
    AI_MATRIX_TEXT,
    AI_SECTION_COUNT_SUFFIX,
    aiMatrixSections,
    aiSectionsBackendTotals,
    aiSectionsMatrixColumns,
    aiSectionsRelevance,
    buildAiMatrixCountDataset,
    buildAiMatrixCsvRows,
    buildAiMatrixScorePoints,
    buildAiMatrixTotalsTable,
    buildAiSectionsMatrixTable,
    isAiSectionsAllTypes,
} from '@/modules/entities/ai-analytics';
import { downloadCsvRows } from '@/modules/entities/report';
import { usePersistedSelection } from '@/modules/shared';
import { aiSectionsColumnHints } from '../lib/ai-matrix-hints.util';
import { aiMatrixLegend } from '../lib/ai-matrix-legend.util';
import { AI_MATRIX_BLOCK_TEXT } from '../lib/ai-matrix-texts';
import {
    AI_SECTIONS_MATRIX_TYPE_KEY,
    aiMatrixPresentUserIds,
    aiMatrixScoreIndicators,
    resolveAiSectionsType,
} from '../lib/ai-types-matrix-view.util';
import { useAiMatrixContext, useAiMatrixCoverage } from './use-ai-matrix-context';
import { useAiTypesDrawer } from './use-ai-types-drawer';
import { useAiTypesMatrixSource } from './use-ai-types-matrix-source';

const CSV_FILENAME = 'ai-sections-matrix.csv';
const CSV_SCORE_LABEL = 'средняя';
/** Типов в периоде нет — матрица строится по несуществующему коду (пустая). */
const NO_TYPE = '';

/**
 * Блок «AI: разделы оценки по типу»: по умолчанию «Все типы» (разборы
 * разделов складываются по видам звонков этапов продаж), тип — фильтр
 * (выбор в localStorage, протухший — «Все типы»); менеджер × раздел по
 * ходу разговора (средняя крупно, оценённых мелко) и колонка «Итог».
 * Подсказки шапки — раздел и его важность для типа из итогов бэка.
 */
export const useAiSectionsMatrix = () => {
    const { section, rows, totalsByType, coverage, callTypes, presentTypes, managerName } =
        useAiTypesMatrixSource();
    const ctx = useAiMatrixContext();
    const coverageView = useAiMatrixCoverage(ctx, coverage);
    const { openWithType } = useAiTypesDrawer();
    const [storedType, setStoredType] = usePersistedSelection(AI_SECTIONS_MATRIX_TYPE_KEY);
    const [showHidden, setShowHidden] = useState(false);

    const callType = useMemo(
        () => resolveAiSectionsType(storedType, presentTypes),
        [storedType, presentTypes],
    );
    const typeCode = callType ?? NO_TYPE;
    const allTypes = isAiSectionsAllTypes(typeCode);
    const options = useMemo<MicroSegmentedOption[]>(
        () => [
            { value: AI_CALL_TYPE_ALL, label: AI_MATRIX_BLOCK_TEXT.sections.allTypes },
            ...presentTypes.map(type => ({ value: type.code, label: type.label })),
        ],
        [presentTypes],
    );
    const columns = useMemo(
        () => aiSectionsMatrixColumns(aiMatrixSections(rows, typeCode, callTypes)),
        [rows, typeCode, callTypes],
    );
    const backendTotals = useMemo(
        () => aiSectionsBackendTotals(totalsByType, typeCode, columns, callTypes),
        [totalsByType, typeCode, columns, callTypes],
    );
    const relevance = useMemo(
        () => aiSectionsRelevance(totalsByType, typeCode, callTypes),
        [totalsByType, typeCode, callTypes],
    );
    const { comparableFrom } = coverageView;

    const buildTable = useCallback(
        (userIds?: ReadonlySet<number>) =>
            buildAiSectionsMatrixTable(rows, typeCode, {
                managerName,
                userIds,
                callTypes,
                comparableFrom,
                onlyWithReviews: !showHidden,
                totals: userIds ? undefined : backendTotals,
            }),
        [rows, typeCode, managerName, callTypes, comparableFrom, showHidden, backendTotals],
    );
    const buildTotalsRow = useCallback(
        (matrix: ReturnType<typeof buildTable>) =>
            buildAiMatrixTotalsTable(matrix, { comparableFrom }, AI_MATRIX_TEXT.hint.totalsRow),
        [comparableFrom],
    );

    const summaryTable = useMemo(() => buildTable(), [buildTable]);
    const totalsRow = useMemo(() => buildTotalsRow(summaryTable), [buildTotalsRow, summaryTable]);
    const columnHints = useMemo(
        () => aiSectionsColumnHints(columns, relevance, allTypes),
        [columns, relevance, allTypes],
    );
    const presentUserIds = useMemo(
        () => aiMatrixPresentUserIds(rows, typeCode),
        [rows, typeCode],
    );
    const indicators = useMemo(() => aiMatrixScoreIndicators(columns), [columns]);
    const countDataset = useMemo(
        () => buildAiMatrixCountDataset(summaryTable, AI_SECTION_COUNT_SUFFIX),
        [summaryTable],
    );
    const scorePoints = useMemo(() => buildAiMatrixScorePoints(summaryTable), [summaryTable]);
    const legend = useMemo(() => aiMatrixLegend(coverageView), [coverageView]);

    const toggleHidden = () => setShowHidden(value => !value);
    // Клик по «Итог» выбранного типа открывает срез по этому типу; у разделов действия нет.
    const openColumn = (code: string) => {
        if (code === columns[columns.length - 1]?.code && !allTypes) openWithType(typeCode);
    };
    const download = () =>
        downloadCsvRows(
            [
                ...buildAiMatrixCsvRows(summaryTable.table, summaryTable.annotations, CSV_SCORE_LABEL),
                ...buildAiMatrixCsvRows(totalsRow.table, totalsRow.annotations, CSV_SCORE_LABEL, false),
            ],
            CSV_FILENAME,
        );

    const isReady = section.status === 'ready';
    const isEmpty = callType === null;

    return {
        section,
        isReady,
        isEmpty,
        canDownload: isReady && !isEmpty,
        coverage: coverageView,
        legend,
        callType,
        allTypes,
        options,
        selectType: setStoredType,
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
