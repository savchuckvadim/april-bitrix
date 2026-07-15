'use client';

import { FC } from 'react';
import { Button } from '@workspace/ui/components/button';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { EventTask } from '@/modules/entities/EventTask/types/event-task-type';
import { getReturnToTMCMenu } from '../model/ReturnToTMCThunk';

/**
 * Кнопка «Вернуть в ТМЦ» — только для презентационных задач,
 * у которых нашлась связанная ТМЦ-сделка (гейт withTM внутри initReturnToTMC).
 */
export const WithTM: FC<{ task: EventTask }> = ({ task }) => {
    const dispatch = useAppDispatch();
    const tmcDeals = useAppSelector(s => s.returnToTmc.tmcDeals);

    const hasTmcDeal = tmcDeals.some(deal => deal.taskId === Number(task.id));
    if (!hasTmcDeal || task.eventType !== 'presentation') return null;

    return (
        <Button
            size="sm"
            variant="ghost"
            className="text-event-supply"
            onClick={() => dispatch(getReturnToTMCMenu(Number(task.id), true))}
        >
            В ТМЦ
        </Button>
    );
};
