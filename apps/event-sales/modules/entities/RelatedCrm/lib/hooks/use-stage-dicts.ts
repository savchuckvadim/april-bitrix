'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { ensureStageDicts } from '../../model/TaskDealsThunk';
import {
    stageEntityIdFromStageId,
    type StageDictItem,
} from '../bound-deal-view';
import type { RelatedStage } from '../../model';

/**
 * Словарь стадий воронки для ОДНОЙ стадии: по её STAGE_ID определяет воронку
 * (префикс `C<id>:`), догружает словарь в слайс, если его ещё нет (кэш и
 * дедупликация запросов — в ensureStageDicts), и отдаёт стадии в порядке
 * воронки, без стадий-провалов.
 *
 * Пока словарь едет, полоска работает на данных графа (order/total) —
 * ожидания на экране нет.
 */
export const useStageDict = (
    stage: RelatedStage | null | undefined,
): StageDictItem[] | undefined => {
    const dispatch = useAppDispatch();
    const dicts = useAppSelector(s => s.taskDeals.stageDicts);
    const entityId = stage ? stageEntityIdFromStageId(stage.bitrixId) : '';

    useEffect(() => {
        if (entityId) dispatch(ensureStageDicts([entityId]));
    }, [dispatch, entityId]);

    return entityId ? dicts[entityId] : undefined;
};
