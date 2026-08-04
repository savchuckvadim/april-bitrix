'use client';

import { FC, useRef, useState } from 'react';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { EventStatusBadge, EventTypeBadge } from '@workspace/april-ui';
import { EventTask } from '@/modules/entities/EventTask/types/event-task-type';
import { getEventTypeAttr } from '@/modules/entities/EventTask/lib/event-type-token';
import { getTaskSummary } from '@/modules/entities/EventTask/lib/task-util';
import { RelationMini, type TaskRelation } from '@/modules/entities/RelatedCrm';
import { EventItemResultType } from '@/modules/widgets/EventItem';
import { useIsClamped } from '../lib/use-is-clamped';
import { EventListActions } from './EventListActions';

interface EventCardProps {
    task: EventTask;
    /**
     * На чём висит дело — сделка или лид из связей клиента. Не передана или
     * пустая — блок связи не рисуется вовсе.
     */
    relation?: TaskRelation;
    onSelect: (status: EventItemResultType, task: EventTask) => void;
}

/**
 * Карточка дела: применяется, когда дел мало (см. lib/list-view.ts).
 * Акцент карточки реактивен по типу события через data-event-type
 * (--event-current, april-tokens.css).
 */
export const EventCard: FC<EventCardProps> = ({ task, relation, onSelect }) => {
    const [isSummaryOpen, setIsSummaryOpen] = useState(false);
    const summaryRef = useRef<HTMLParagraphElement>(null);
    const summary = getTaskSummary(task.description);
    const isClamped = useIsClamped(summaryRef, summary);

    return (
        <Card
            data-event-type={getEventTypeAttr(task.eventType)}
            className="gap-3 overflow-hidden border-l-4 border-l-[var(--event-current)] py-4"
        >
            <CardHeader className="gap-2 px-4">
                <div className="flex flex-wrap items-center gap-2">
                    <EventTypeBadge type={task.type} />
                    <EventStatusBadge status={task.isExpired} />
                    <span className="ml-auto whitespace-nowrap text-xs text-muted-foreground">
                        {task.deadline}
                    </span>
                </div>
                <p className="text-base font-medium leading-snug">{task.name}</p>
                {relation && (
                    <RelationMini
                        deal={relation.deal}
                        lead={relation.lead}
                        className="mt-0.5"
                    />
                )}
            </CardHeader>

            {summary && (
                <CardContent className="px-4">
                    <p
                        ref={summaryRef}
                        className={`text-sm leading-relaxed text-muted-foreground ${
                            isSummaryOpen ? '' : 'line-clamp-3'
                        }`}
                    >
                        {summary}
                    </p>
                    {(isClamped || isSummaryOpen) && (
                        <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 text-xs"
                            onClick={() => setIsSummaryOpen(open => !open)}
                        >
                            {isSummaryOpen ? 'Свернуть' : 'Показать полностью'}
                        </Button>
                    )}
                </CardContent>
            )}

            <CardFooter className="px-4">
                <EventListActions task={task} onSelect={onSelect} />
            </CardFooter>
        </Card>
    );
};
