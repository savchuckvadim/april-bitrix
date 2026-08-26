'use client';

import { FC } from 'react';
import { ExternalLink } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import { EventTypeBadge } from '@workspace/april-ui';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { getTaskUrl } from '@/modules/app/lib/utills/url';
import { getEventTypeLabel } from '@/modules/entities/EventTask/lib/event-request-type';
import { EventTask } from '@/modules/entities/EventTask/types/event-task-type';
import { DEADLINE_VIEW } from '../lib/deadline-view';

interface OtherTaskRowProps {
    task: EventTask;
}

/**
 * Соседнее дело клиента, когда мы встроены в конкретную задачу.
 *
 * Отчитаться отсюда нельзя намеренно: приложение открыто В ЭТОЙ задаче, и
 * отчёт по соседней ушёл бы не туда, куда смотрит менеджер. Поэтому строка —
 * не карточка: без кнопок, приглушённая, и единственное действие — открыть
 * саму задачу в Битриксе соседним окном.
 */
export const OtherTaskRow: FC<OtherTaskRowProps> = ({ task }) => {
    const domain = useAppSelector(s => s.app.domain);
    const deadline = DEADLINE_VIEW[task.isExpired];
    const url = getTaskUrl(domain, task.id);

    const content = (
        <>
            <EventTypeBadge
                type={getEventTypeLabel({
                    eventType: task.eventType,
                    type: task.type,
                    ufCrmTask: task.ufCrmTask,
                })}
            />
            <span
                title={task.name}
                className="min-w-0 flex-1 truncate text-sm"
            >
                {task.name}
            </span>
            <span
                className={cn(
                    'shrink-0 whitespace-nowrap text-xs',
                    deadline.className,
                )}
            >
                {deadline.prefix}
                {task.deadline}
            </span>
        </>
    );

    if (!url) {
        return (
            <div className="flex items-center gap-2 rounded-md border border-border px-2 py-1.5 opacity-60">
                {content}
            </div>
        );
    }

    return (
        <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-md border border-border px-2 py-1.5 opacity-70 transition-opacity hover:opacity-100"
        >
            {content}
            <ExternalLink aria-hidden className="size-3.5 shrink-0" />
        </a>
    );
};
