'use client';

import { FC, MouseEvent } from 'react';
import { ExternalLink } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { openPortalCard } from '@/modules/app/lib/utills/open-portal-card';
import { getTaskPath, getTaskUrl } from '@/modules/app/lib/utills/url';
import type { EventTask } from '../types/event-task-type';

interface TaskLinkProps {
    task: Pick<EventTask, 'id' | 'groupId' | 'responsibleId'>;
    className?: string;
}

/**
 * Еле заметная ссылка «№ задачи» — открыть саму задачу Битрикса слайдером.
 *
 * Зачем: «Звонки» находят дела по привязке задачи к сделке, а карточка
 * сделки показывает CRM-дела. Если дело задачи не создалось (garant 33467,
 * 11.11.2026: удалённый лид в привязках), задача видна в приложении и
 * невидима в сделке — открыть, закрыть или сверить её было неоткуда.
 *
 * Обычный клик — слайдер поверх портала (запасной путь — новая вкладка);
 * Ctrl/Cmd/средняя кнопка — браузер сам откроет ссылку в новой вкладке.
 */
export const TaskLink: FC<TaskLinkProps> = ({ task, className }) => {
    const domain = useAppSelector(s => s.app.domain);
    const options = { groupId: task.groupId, userId: task.responsibleId };
    const path = getTaskPath(task.id, options);
    const url = getTaskUrl(domain, task.id, options);
    if (!path || !url) return null;

    const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
        if (event.ctrlKey || event.metaKey || event.shiftKey) return;
        event.preventDefault();
        void openPortalCard(path, url);
    };

    return (
        <a
            href={url}
            target="_blank"
            rel="noreferrer"
            onClick={onClick}
            title="Открыть задачу в Битриксе"
            className={cn(
                'inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap text-[11px] leading-none text-muted-foreground opacity-60 transition-opacity hover:underline hover:opacity-100 focus-visible:opacity-100',
                className,
            )}
        >
            №{task.id}
            <ExternalLink aria-hidden className="size-2.5" />
        </a>
    );
};
