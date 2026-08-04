'use client';

import { FC } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { EventTask } from '@/modules/entities/EventTask/types/event-task-type';
import {
    EventItemResultType,
    getResultMenu,
} from '@/modules/widgets/EventItem';
import { useEventNavigation } from '@/modules/processes/event';
import { EventCard } from '@/modules/widgets/EventList/ui/EventCard';
import { EventListSkeleton } from '@/modules/widgets/EventList/ui/EventListSkeleton';

/**
 * Дела по клиенту — единственная секция, где менеджер действует, а не читает.
 *
 * Карточка дела та же, что в списке событий: одинаковый вид и рабочие кнопки.
 * Скролл — у самой секции, а не у страницы: дел бывает и три, и триста, и в
 * последнем случае шапка со сделками не должна уезжать вверх.
 */
export const EntityTasksCard: FC = () => {
    const dispatch = useAppDispatch();
    const nav = useEventNavigation();

    const tasks = useAppSelector(s => s.eventTask.tasks);
    const isFetched = useAppSelector(s => s.eventTask.isFetched);

    const selectEvent = async (status: EventItemResultType, task: EventTask) => {
        await dispatch(getResultMenu(status, task));
        nav.toItem();
    };

    return (
        <Card className="flex min-h-0 flex-col">
            <CardHeader>
                <CardTitle className="text-base">
                    Дела{tasks?.length ? ` (${tasks.length})` : ''}
                </CardTitle>
            </CardHeader>

            <CardContent className="min-h-0 flex-1 overflow-y-auto">
                {!isFetched ? (
                    <EventListSkeleton />
                ) : tasks?.length ? (
                    <div className="grid gap-3">
                        {tasks.map((task, index) => (
                            <EventCard
                                key={`board-task-${task.id ?? index}`}
                                task={task}
                                onSelect={selectEvent}
                            />
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">
                        Открытых событий нет.
                    </p>
                )}
            </CardContent>
        </Card>
    );
};
