'use client';

import { FC } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import { SectionState } from '@/modules/shared/SectionState';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { reloadApp } from '@/modules/app/model/thunk/AppThunk';
import { EventTask } from '@/modules/entities/EventTask/types/event-task-type';
import { getTaskLinks } from '@/modules/entities/EventTask/lib/task-links';
import {
    resolveTaskRelation,
    type RelatedCrmDetails,
} from '@/modules/entities/RelatedCrm';
import {
    EventItemResultType,
    getResultMenu,
} from '@/modules/widgets/EventItem';
import { useEventNavigation } from '@/modules/processes/event';
import { EventCard } from '@/modules/widgets/EventList/ui/EventCard';
import { OtherTaskRow } from '@/modules/widgets/EventList/ui/OtherTaskRow';
import { APP_DISPLAY_MODE } from '@/modules/app/types/app/app-type';

interface EntityTasksCardProps {
    /** Связи клиента — из них карточка дела берёт свою сделку или лид. */
    details: RelatedCrmDetails | null;
}

/**
 * Дела по клиенту — единственная секция, где менеджер действует, а не читает.
 *
 * Карточка дела та же, что в списке событий: одинаковый вид и рабочие кнопки.
 * Скролл — у самой секции, а не у страницы: дел бывает и три, и триста, и в
 * последнем случае шапка со сделками не должна уезжать вверх.
 */
export const EntityTasksCard: FC<EntityTasksCardProps> = ({ details }) => {
    const dispatch = useAppDispatch();
    const nav = useEventNavigation();

    const tasks = useAppSelector(s => s.eventTask.tasks);
    const status = useAppSelector(s => s.eventTask.status);
    // Привязанные к задачам сделки (наполняет листенер setFetchedTasks).
    const boundDealsById = useAppSelector(s => s.taskDeals.byId);
    // Встройка в задачу: работаем по ней одной, соседние дела только показываем.
    const isTaskMode = useAppSelector(
        s => s.app.display.mode === APP_DISPLAY_MODE.TASK,
    );
    const currentTaskId = useAppSelector(s => s.eventTask.current?.id);
    const visibleTasks = isTaskMode
        ? (tasks ?? []).filter(task => task.id === currentTaskId)
        : (tasks ?? []);
    const otherTasks = isTaskMode
        ? (tasks ?? []).filter(task => task.id !== currentTaskId)
        : [];

    const selectEvent = async (
        resultType: EventItemResultType,
        task: EventTask,
    ) => {
        await dispatch(getResultMenu(resultType, task));
        nav.toItem();
    };

    return (
        <Card className="flex min-h-0 flex-col">
            <CardHeader>
                <CardTitle className="text-base">
                    {isTaskMode ? 'Текущее дело' : 'Дела'}
                    {!isTaskMode && tasks?.length ? ` (${tasks.length})` : ''}
                </CardTitle>
            </CardHeader>

            <CardContent className="min-h-0 flex-1 overflow-y-auto">
                <SectionState
                    status={status}
                    isEmpty={!tasks?.length}
                    emptyText="Открытых событий нет."
                    errorText="Не удалось загрузить события — портал не ответил."
                    onRetry={() => dispatch(reloadApp())}
                >
                    <div className="grid gap-3">
                        {visibleTasks.map((task, index) => {
                            const links = getTaskLinks(task);
                            return (
                                <EventCard
                                    key={`board-task-${task.id ?? index}`}
                                    task={task}
                                    relation={resolveTaskRelation({
                                        details,
                                        boundDeals:
                                            Object.values(boundDealsById),
                                        dealIds: links.dealIds,
                                        leadIds: links.leadIds,
                                    })}
                                    spacious={isTaskMode}
                                    onSelect={selectEvent}
                                />
                            );
                        })}
                    </div>

                    {otherTasks.length > 0 && (
                        <div className="mt-3 space-y-1.5">
                            <p className="text-xs text-muted-foreground">
                                Ещё по клиенту ({otherTasks.length}) — открыть в
                                Битриксе
                            </p>
                            {otherTasks.map(task => (
                                <OtherTaskRow
                                    key={`other-task-${task.id}`}
                                    task={task}
                                />
                            ))}
                        </div>
                    )}
                </SectionState>
            </CardContent>
        </Card>
    );
};
