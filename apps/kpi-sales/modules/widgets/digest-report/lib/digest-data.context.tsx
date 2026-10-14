'use client';

import { createContext, useContext } from 'react';
import type { StructureSection } from '@/modules/entities/department';
import type {
    DigestAverages,
    DigestReport,
    DigestRow,
} from '@/modules/entities/digest';

/**
 * Готовые данные дайджеста для под-виджетов: строки по сотрудникам,
 * секции структуры, средние, фокус. Считаются один раз в DigestBody
 * (use-digest-data), под-виджеты только читают.
 */
export interface DigestDataValue {
    report: DigestReport;
    /** Все запрошенные сотрудники. */
    rows: DigestRow[];
    /** Секции отделов / групп, в которых есть сотрудники из данных. */
    sections: StructureSection[];
    groupSections: StructureSection[];
    averages: DigestAverages;
    /** Сотрудник в фокусе (клик по строке); null — вся выборка. */
    focusUserId: number | null;
    focusRow: DigestRow | null;
    /** Строки для блоков: фокус — одна, иначе все. */
    visibleRows: DigestRow[];
    /** Один сотрудник в поле зрения (фокус или единственный в выборке). */
    singleRow: DigestRow | null;
    date: string;
    domain: string;
}

const DigestDataContext = createContext<DigestDataValue | null>(null);

export const DigestDataProvider = DigestDataContext.Provider;

export const useDigestData = (): DigestDataValue => {
    const value = useContext(DigestDataContext);
    if (!value) {
        throw new Error('useDigestData вызван вне DigestDataProvider');
    }
    return value;
};
