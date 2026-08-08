'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { ensureStageDicts } from '../../model/TaskDealsThunk';
import {
    stageEntityIdFromStageId,
    type StageDictItem,
} from '../bound-deal-view';
import type { RelatedDeal } from '../../model';

/**
 * Словари стадий для полосок: по STAGE_ID видимых сделок определяет их
 * воронки, догружает недостающие словари (кэш в слайсе taskDeals) и отдаёт
 * карту ENTITY_ID → стадии. Пока словарь едет, тултип показывает только
 * текущую стадию — полоска работает без ожидания.
 */
export const useStageDicts = (
    deals: RelatedDeal[],
): Record<string, StageDictItem[]> => {
    const dispatch = useAppDispatch();
    const dicts = useAppSelector(s => s.taskDeals.stageDicts);

    // Строка-ключ вместо массива: массив пересоздаётся каждый рендер и
    // зациклил бы эффект.
    const entityIdsKey = [
        ...new Set(
            deals.map(deal => stageEntityIdFromStageId(deal.stage.bitrixId)),
        ),
    ].join(',');

    useEffect(() => {
        if (entityIdsKey) {
            dispatch(ensureStageDicts(entityIdsKey.split(',')));
        }
    }, [dispatch, entityIdsKey]);

    return dicts;
};
