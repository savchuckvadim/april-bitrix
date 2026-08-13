'use client';

import { useCallback, useMemo } from 'react';
import { getHistoryStatus, type HistoryStatusView } from '../history-status';
import type { EVHistoryRecord } from '../../model/history-record.type';

/**
 * Исход записи истории. «Сейчас» берётся один раз на монтирование: иначе при
 * каждом рендере ленты запись у границы срока прыгала бы между «запланировано»
 * и «просрочено».
 */
export const useHistoryStatus = (): ((
    record: EVHistoryRecord,
) => HistoryStatusView) => {
    const now = useMemo(() => Date.now(), []);
    return useCallback(record => getHistoryStatus(record, now), [now]);
};
