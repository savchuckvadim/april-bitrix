'use client';

import { useCallback, useMemo } from 'react';
import type { MicroSegmentedOption } from '@workspace/april-ui';
import {
    buildAiMatrixCsvTable,
    buildAiSectionsCountRatingDataset,
    buildAiSectionsMatrixTable,
    buildAiSectionsScorePoints,
} from '@/modules/entities/ai-analytics';
import { exportTableToCSV } from '@/modules/entities/report';
import { usePersistedSelection } from '@/modules/shared';
import {
    AI_SECTIONS_MATRIX_TYPE_KEY,
    aiMatrixPresentUserIds,
    aiSectionsScoreIndicators,
    resolveAiSectionsType,
} from '../lib/ai-types-matrix-view.util';
import { useAiTypesMatrixSource } from './use-ai-types-matrix-source';

const CSV_FILENAME = 'ai-sections-matrix.csv';
/** Типов в периоде нет — матрица строится по несуществующему коду (пустая). */
const NO_TYPE = '';

/**
 * Блок «AI: разделы оценки по типу»: переключатель типа
 * (только типы со звонками за период; выбор в localStorage, протухший —
 * первый тип), матрица менеджер × раздел рубрики (оценённых звонков +
 * средняя) и сводная колонка «Все разборы». buildTable(userIds) — таблица
 * секции разбивки.
 */
export const useAiSectionsMatrix = () => {
    const { section, rows, presentTypes, managerName } =
        useAiTypesMatrixSource();
    const [storedType, setStoredType] = usePersistedSelection(
        AI_SECTIONS_MATRIX_TYPE_KEY,
    );

    const callType = useMemo(
        () => resolveAiSectionsType(storedType, presentTypes),
        [storedType, presentTypes],
    );
    const typeCode = callType ?? NO_TYPE;
    const options = useMemo<MicroSegmentedOption[]>(
        () =>
            presentTypes.map(type => ({
                value: type.code,
                label: type.label,
            })),
        [presentTypes],
    );
    const presentUserIds = useMemo(
        () => aiMatrixPresentUserIds(rows, typeCode),
        [rows, typeCode],
    );
    const buildTable = useCallback(
        (userIds?: ReadonlySet<number>) =>
            buildAiSectionsMatrixTable(rows, typeCode, {
                managerName,
                userIds,
            }),
        [rows, typeCode, managerName],
    );
    const summaryTable = useMemo(() => buildTable(), [buildTable]);
    const indicators = useMemo(
        () => aiSectionsScoreIndicators(summaryTable.sections),
        [summaryTable.sections],
    );
    const countDataset = useMemo(
        () => buildAiSectionsCountRatingDataset(rows, typeCode, managerName),
        [rows, typeCode, managerName],
    );
    const scorePoints = useMemo(
        () => buildAiSectionsScorePoints(rows, typeCode, managerName),
        [rows, typeCode, managerName],
    );

    const download = () =>
        exportTableToCSV(
            buildAiMatrixCsvTable(summaryTable.table, summaryTable.annotations),
            CSV_FILENAME,
        );

    const isReady = section.status === 'ready';
    const isEmpty = callType === null;

    return {
        section,
        isReady,
        isEmpty,
        canDownload: isReady && !isEmpty,
        callType,
        options,
        selectType: setStoredType,
        presentUserIds,
        indicators,
        countDataset,
        scorePoints,
        summaryTable,
        buildTable,
        download,
    };
};
