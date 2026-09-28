'use client';

import { FC } from 'react';
import { UserRoundCheck } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import type { EventTask } from '@/modules/entities/EventTask/types/event-task-type';
import { useTaskOwnerName } from '../lib/hooks/use-task-owner';
import { HEAD_MODE_TEXT } from '../lib/head-mode-texts';

interface TaskOwnerChipProps {
    task: EventTask;
    className?: string;
}

/**
 * Подпись «Дело сотрудника: Имя» в списке дел. У своих дел не рисуется:
 * руководителю важно отличать чужую работу от своей одним взглядом.
 */
export const TaskOwnerChip: FC<TaskOwnerChipProps> = ({ task, className }) => {
    const ownerName = useTaskOwnerName(task);

    if (!ownerName) return null;

    return (
        <span
            className={cn(
                'inline-flex min-w-0 items-center gap-1 text-xs text-warning',
                className,
            )}
        >
            <UserRoundCheck aria-hidden className="size-3 shrink-0" />
            <span className="min-w-0 truncate">
                {HEAD_MODE_TEXT.ownerPrefix} {ownerName}
            </span>
        </span>
    );
};
