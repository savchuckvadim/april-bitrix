'use client';

import { FC } from 'react';
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { EventTask } from '@/modules/entities/EventTask/types/event-task-type';
import {
    EventItemResultType,
    getResultMenu,
} from '@/modules/widgets/EventItem';
import { useEventNavigation } from '@/modules/processes/event';
import { NoCallMenu } from '@/modules/features/NoCall';
import { ReturnToTMCMenu } from '@/modules/features/ReturnToTMC';
import { EventListHeader } from './EventListHeader';
import { EventListRow } from './EventListRow';
import { EventListSkeleton } from './EventListSkeleton';

/**
 * Список событий (задач обзвона) с действиями по строке.
 * Паттерн навигации: thunk меняет состояние → UI зовёт nav.toItem().
 */
export const EventList: FC = () => {
    const dispatch = useAppDispatch();
    const nav = useEventNavigation();

    const tasks = useAppSelector(state => state.eventTask.tasks);
    const isFetched = useAppSelector(state => state.eventTask.isFetched);

    const selectEvent = async (status: EventItemResultType, task: EventTask) => {
        await dispatch(getResultMenu(status, task));
        nav.toItem();
    };
    

    return (
        <div className="p-2 pt-0">
            <NoCallMenu />
            <ReturnToTMCMenu />
            <EventListHeader />

            {!isFetched ? (
                <EventListSkeleton />
            ) : !tasks?.length ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                    Открытых событий нет
                </p>
            ) : (
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>#</TableHead>
                                <TableHead>Что надо сделать</TableHead>
                                <TableHead>Тип</TableHead>
                                <TableHead>Крайний срок</TableHead>
                                <TableHead className="hidden sm:table-cell">
                                    Текущий статус
                                </TableHead>
                                <TableHead>Действие</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tasks.map((task, i) => (
                                <EventListRow
                                    key={`event-row-${task.id ?? i}`}
                                    task={task}
                                    index={i}
                                    onSelect={selectEvent}
                                />
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
};

export default EventList;
