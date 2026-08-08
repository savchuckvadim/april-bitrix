'use client';

import { FC } from 'react';
import { Button } from '@workspace/ui/components/button';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { getIsLeadContext } from '@/modules/app/lib/utills/app-state-util';
import { EventTask } from '@/modules/entities/EventTask/types/event-task-type';
import { EventItemResultType } from '@/modules/widgets/EventItem';
import { DEPARTAMENT_STATE_PROP } from '@/modules/features/Departament/type/department-type';
import { NoCallButton } from '@/modules/features/NoCall';
import { WithTM } from '@/modules/features/ReturnToTMC';

interface EventListActionsProps {
    task: EventTask;
    onSelect: (status: EventItemResultType, task: EventTask) => void;
}

/** Действия по строке события. */
export const EventListActions: FC<EventListActionsProps> = ({ task, onSelect }) => {
    const isLeadContext = useAppSelector(getIsLeadContext);
    const isTmcMode = useAppSelector(
        s => s.department[DEPARTAMENT_STATE_PROP.MODE].current?.code === 'tmc',
    );

    return (
        // Тихие действия слева, главное — последним, ближе к правому краю.
        <div className="flex flex-wrap items-center justify-end gap-2">
            {!isTmcMode && !isLeadContext && (
                <NoCallButton taskId={Number(task.id)} />
            )}
            {!isLeadContext && <WithTM task={task} />}
            <Button
                size="sm"
                variant="outline"
                onClick={() => onSelect(EventItemResultType.NORESULT, task)}
            >
                Не очень
            </Button>
            <Button
                size="sm"
                onClick={() => onSelect(EventItemResultType.RESULT, task)}
            >
                Результативный
            </Button>
        </div>
    );
};
