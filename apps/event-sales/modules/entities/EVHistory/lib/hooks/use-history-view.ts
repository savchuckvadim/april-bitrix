'use client';

import { useMemo, useState } from 'react';
import type { SectionStatus } from '@/modules/shared/SectionState';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    EVHistoryGroupState,
    EVHistoryRecord,
} from '../../model/history-record.type';

/** Режим группировки ленты (as const — литеральные типы). */
export const EHistoryViewMode = {
    ENTITY: 'entity',
    DATE: 'date',
} as const;

export type HistoryViewMode =
    (typeof EHistoryViewMode)[keyof typeof EHistoryViewMode];

/** Группа для режима «по сущностям»: записи без повторов между группами. */
export interface HistoryEntityGroup {
    group: EVHistoryGroupState;
    records: EVHistoryRecord[];
    /** Сколько записей группы скрыто как повторы из групп выше. */
    hiddenDuplicates: number;
}

export interface HistoryView {
    status: SectionStatus;
    isListMissing: boolean;
    isEmpty: boolean;
    mode: HistoryViewMode;
    setMode: (mode: HistoryViewMode) => void;
    /** «По сущностям»: группы в порядке приоритета, повторы схлопнуты. */
    entityGroups: HistoryEntityGroup[];
    /** «По датам»: все уникальные записи, свежие сверху. */
    dateRecords: EVHistoryRecord[];
}

/**
 * Готовые данные для карточки истории: группировки, дедуп повторов, сортировка.
 * Компоненты ничего не вычисляют — только рисуют (правило front-refactor).
 */
export const useHistoryView = (): HistoryView => {
    const status = useAppSelector(s => s.eventHistory.status);
    const isListMissing = useAppSelector(s => s.eventHistory.isListMissing);
    const records = useAppSelector(s => s.eventHistory.records);
    const groups = useAppSelector(s => s.eventHistory.groups);
    const [mode, setMode] = useState<HistoryViewMode>(EHistoryViewMode.ENTITY);

    const entityGroups = useMemo<HistoryEntityGroup[]>(() => {
        const seen = new Set<number>();
        return groups
            .map(group => {
                const own: EVHistoryRecord[] = [];
                let hidden = 0;
                for (const id of group.ids) {
                    const record = records[id];
                    if (!record) continue;
                    if (seen.has(id)) {
                        hidden += 1;
                        continue;
                    }
                    seen.add(id);
                    own.push(record);
                }
                return { group, records: own, hiddenDuplicates: hidden };
            })
            .filter(item => item.records.length > 0 || item.group.next !== null);
    }, [groups, records]);

    const dateRecords = useMemo<EVHistoryRecord[]>(
        () =>
            Object.values(records).sort(
                (a, b) => (b.dateTs ?? 0) - (a.dateTs ?? 0),
            ),
        [records],
    );

    return {
        status,
        isListMissing,
        isEmpty: dateRecords.length === 0,
        mode,
        setMode,
        entityGroups,
        dateRecords,
    };
};
