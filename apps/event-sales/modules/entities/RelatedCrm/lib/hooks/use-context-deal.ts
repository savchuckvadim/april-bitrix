'use client';

import { useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import type { RelatedDeal } from '../../model';
import { ensureStageDicts } from '../../model/TaskDealsThunk';
import { dealStageEntityId, mapBoundDeal } from '../bound-deal-view';
import { toContextDealRow } from '../context-deal';
import { buildDealCategoryCodeMap } from '../deal-category';

/**
 * Сделка плейсмента в том же виде, что сделки из связей клиента — для
 * главной полоски шапки.
 *
 * Запросов за самой сделкой нет: она уже в сторе после бута. Нужен только
 * словарь стадий её воронки — он берётся из браузерного кэша (сутки), в
 * портал уходит раз в день (см. stage-dict-cache). Пока словаря нет,
 * сделка отдаётся без позиции стадии — полоска просто не рисуется.
 */
export const useContextDeal = (): RelatedDeal | null => {
    const dispatch = useAppDispatch();
    const deal = useAppSelector(s => s.app.bitrix.deal);
    const stageDicts = useAppSelector(s => s.taskDeals.stageDicts);
    const categories = useAppSelector(
        s => s.portal.portal?.bitrixDeal?.categories,
    );

    const row = useMemo(() => toContextDealRow(deal), [deal]);
    const entityId = row ? dealStageEntityId(row.CATEGORY_ID) : '';

    useEffect(() => {
        if (entityId) void dispatch(ensureStageDicts([entityId]));
    }, [dispatch, entityId]);

    return useMemo(
        () =>
            row
                ? mapBoundDeal(
                      row,
                      stageDicts[entityId],
                      buildDealCategoryCodeMap(categories),
                  )
                : null,
        [row, stageDicts, entityId, categories],
    );
};
