'use client';

import { FC } from 'react';
import { Spinner } from '@workspace/april-ui';
import { Button } from '@workspace/ui/components/button';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { getIsLeadContext } from '@/modules/app/lib/utills/app-state-util';
import { EventTask } from '@/modules/entities/EventTask/types/event-task-type';
import { EventItemResultType } from '@/modules/widgets/EventItem';
import { DEPARTAMENT_STATE_PROP } from '@/modules/features/Departament/type/department-type';
import { NoCallButton } from '@/modules/features/NoCall';
import { WithTM } from '@/modules/features/ReturnToTMC';
import { FLOW_STAGE } from '@/modules/processes/event/model/FlowStatusSlice';

interface EventListActionsProps {
    task: EventTask;
    onSelect: (status: EventItemResultType, task: EventTask) => void;
}

/** Действия по строке события. */
export const EventListActions: FC<EventListActionsProps> = ({
    task,
    onSelect,
}) => {
    const isLeadContext = useAppSelector(getIsLeadContext);
    const isTmcMode = useAppSelector(
        s => s.department[DEPARTAMENT_STATE_PROP.MODE].current?.code === 'tmc',
    );
    // По этому делу отчёт ещё отправляется: дело в Битриксе пока открыто,
    // но второй отчёт по нему — дубль (сервер его и не примет).
    const isSending = useAppSelector(
        s =>
            s.flowStatus.stage === FLOW_STAGE.SENDING &&
            s.flowStatus.sentTaskId !== null &&
            s.flowStatus.sentTaskId === Number(task.id),
    );

    if (isSending) {
        return (
            <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
                <Spinner size="sm" tone="event" label="Отчёт отправляется" />
                Отчёт отправляется…
            </div>
        );
    }

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
