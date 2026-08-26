'use client';

import { FC } from 'react';
import { TableCell, TableRow } from '@workspace/ui/components/table';
import {
    EventStatusBadge,
    EventTypeBadge,
    HintTooltip,
} from '@workspace/april-ui';
import { getEventTypeLabel } from '@/modules/entities/EventTask/lib/event-request-type';
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
            <TableCell className="text-muted-foreground">
                {index + 1}.
            </TableCell>
            <TableCell className="max-w-64 whitespace-normal font-medium">
                {/* Комментарий планирования в табличном виде негде показать
                    (в карточках он есть) — отдаём тултипом по имени
                    (todo2508 №6). */}
                {/* Длинное имя не растягивает строку: две строки с
                    многоточием; полное — по наведению (у строки с
                    комментарием тултип уже занят, native title не вешаем). */}
                {task.eventComment ? (
                    <HintTooltip title={task.eventComment}>
                        <span className="line-clamp-2 cursor-help break-words underline decoration-dotted decoration-border underline-offset-2">
                            {task.name}
                        </span>
                    </HintTooltip>
                ) : (
                    <span
                        title={task.name}
                        className="line-clamp-2 break-words"
                    >
                        {task.name}
                    </span>
                )}
            </TableCell>
            <TableCell>
                <EventTypeBadge
                    type={getEventTypeLabel({
                        eventType: task.eventType,
                        type: task.type,
                        ufCrmTask: task.ufCrmTask,
                    })}
                />
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
