'use client';

import { FC } from 'react';
import { TableCell, TableRow } from '@workspace/ui/components/table';
import { EventStatusBadge, EventTypeBadge } from '@workspace/april-ui';
import { EventTask } from '@/modules/entities/EventTask/types/event-task-type';
import { EventItemResultType } from '@/modules/widgets/EventItem';
import { EventListActions } from './EventListActions';

interface EventListRowProps {
    task: EventTask;
    index: number;
    onSelect: (status: EventItemResultType, task: EventTask) => void;
}

export const EventListRow: FC<EventListRowProps> = ({
    task,
    index,
    onSelect,
}) => {
    return (
        <TableRow>
            <TableCell className="text-muted-foreground">{index + 1}.</TableCell>
            <TableCell className="max-w-64 whitespace-normal font-medium">
                {task.name}
            </TableCell>
            <TableCell>
                <EventTypeBadge type={task.type} />
            </TableCell>
            <TableCell className="whitespace-nowrap text-muted-foreground">
                {task.deadline}
            </TableCell>
            <TableCell className="hidden sm:table-cell">
                <EventStatusBadge status={task.isExpired} />
            </TableCell>
            <TableCell>
                <EventListActions task={task} onSelect={onSelect} />
            </TableCell>
        </TableRow>
    );
};
