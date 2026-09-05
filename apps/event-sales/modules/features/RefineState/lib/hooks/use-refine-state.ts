'use client';

import { useMemo } from 'react';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { readRefineState, type RefineState } from '../refine-state';

/**
 * Состояние «на доработке» сделки плейсмента.
 *
 * Ограничение первого релиза: читаем только `s.app.bitrix.deal` — сделку
 * встройки. При плейсменте-компании или задаче основная сделка сюда не
 * грузится, и бейджа нет (расширение через RelatedCrm — шаг 8б плана
 * `docs/refine-state.tasks.md`).
 */
export const useRefineState = (): RefineState | null => {
    const deal = useAppSelector(s => s.app.bitrix.deal);
    const fields = useAppSelector(
        s => s.portal.portal?.bitrixDeal?.bitrixfields ?? null,
    );
    return useMemo(
        () =>
            readRefineState(
                fields,
                deal as unknown as Record<string, unknown> | null,
            ),
        [fields, deal],
    );
};
