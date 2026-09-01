'use client';

import { FC } from 'react';
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import { SectionState } from '@/modules/shared/SectionState';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { EventTask } from '@/modules/entities/EventTask/types/event-task-type';
import { getTaskLinks } from '@/modules/entities/EventTask/lib/task-links';
import {
    resolveTaskRelation,
    useCurrentRelations,
} from '@/modules/entities/RelatedCrm';
import {
    EventItemResultType,
    getResultMenu,
} from '@/modules/widgets/EventItem';
import { useEventNavigation } from '@/modules/processes/event';
// Прямой путь: барель outbox тянет дренаж, списку нужна только полоска.
import { OutboxNoticeBanner } from '@/modules/processes/event-outbox/ui/OutboxNoticeBanner';
import { reloadApp } from '@/modules/app/model/thunk/AppThunk';
import { ActionPromptCard } from '@/modules/features/ActionPrompts';
import { LeadConfirmGate } from '@/modules/features/LeadRequestCard';
import { NoCallMenu } from '@/modules/features/NoCall';
import { ReturnToTMCMenu } from '@/modules/features/ReturnToTMC';
import { getEventListView } from '../lib/list-view';
import { EventCard } from './EventCard';
import { FlowStatusBanner } from './FlowStatusBanner';
import { EventListRow } from './EventListRow';

/**
 * Список событий (задач обзвона) с действиями по строке.
 * Паттерн навигации: thunk меняет состояние → UI зовёт nav.toItem().
 */
// «Все контакты» из низа списка переехали во вкладку «контакты»
// (EventListTabs) — дубль карточки убран (todo2508 №6).

export const EventList: FC = () => {
    const dispatch = useAppDispatch();
    const nav = useEventNavigation();

    const tasks = useAppSelector(state => state.eventTask.tasks);
    const status = useAppSelector(state => state.eventTask.status);
    // Привязанные к задачам сделки (наполняет листенер setFetchedTasks).
    const boundDealsById = useAppSelector(state => state.taskDeals.byId);

    const view = getEventListView(tasks?.length ?? 0);

    // Связи уже в сторе (их грузит листенер для шапки-layout) — здесь только
    // чтение для миниатюр карточек.
    const { details } = useCurrentRelations();

    const selectEvent = async (
        status: EventItemResultType,
        task: EventTask,
    ) => {
        await dispatch(getResultMenu(status, task));
        nav.toItem();
    };

    return (
        <div className="p-2 pt-0">
            <LeadConfirmGate />
            <ActionPromptCard />
            <NoCallMenu />
            <ReturnToTMCMenu />
            {/* Действия списка (обновить, создать, статистика, темы) — в
                правом верхнем углу общей шапки; своей строки у списка нет. */}
            <FlowStatusBanner />
            {/* Отчёты, сохранённые в браузере: сколько ждёт, что уезжает
                сейчас и что требует сверки — той же тонкой полоской. */}
            <OutboxNoticeBanner />

            <SectionState
                status={status}
                isEmpty={!tasks?.length}
                emptyText="Открытых событий нет"
                errorText="Не удалось загрузить события — портал не ответил."
                onRetry={() => dispatch(reloadApp())}
            >
                {view === 'cards' ? (
                    <div className="grid gap-3">
                        {tasks?.map((task, i) => {
                            const links = getTaskLinks(task);
                            return (
                                <EventCard
                                    key={`event-card-${task.id ?? i}`}
                                    task={task}
                                    relation={resolveTaskRelation({
                                        details,
                                        boundDeals:
                                            Object.values(boundDealsById),
                                        dealIds: links.dealIds,
                                        leadIds: links.leadIds,
                                        // Градиент основной живёт в общей
                                        // шапке — в карточках он дублировал бы
                                        // её и съедал лимит полосок.
                                        withMainDeal: false,
                                    })}
                                    onSelect={selectEvent}
                                />
                            );
                        })}
                    </div>
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
                                {tasks?.map((task, i) => (
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
            </SectionState>
        </div>
    );
};

export default EventList;
