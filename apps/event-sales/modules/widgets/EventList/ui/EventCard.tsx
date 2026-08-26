'use client';

import { FC } from 'react';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from '@workspace/ui/components/card';
import { cn } from '@workspace/ui/lib/utils';
import { EventTypeBadge } from '@workspace/april-ui';
import { getEventTypeLabel } from '@/modules/entities/EventTask/lib/event-request-type';
import { EventTask } from '@/modules/entities/EventTask/types/event-task-type';
import { getEventTypeAttr } from '@/modules/entities/EventTask/lib/event-type-token';
import { getTaskSummary } from '@/modules/entities/EventTask/lib/task-util';
import { getTaskLinks } from '@/modules/entities/EventTask/lib/task-links';
import { TaskContactChip } from '@/modules/entities/EventContact';
import {
    RelationDealBars,
    RelationMini,
    type TaskRelation,
} from '@/modules/entities/RelatedCrm';
import { EventItemResultType } from '@/modules/widgets/EventItem';
import { DEADLINE_VIEW } from '../lib/deadline-view';
import { EventListActions } from './EventListActions';
import { FogText } from './FogText';

interface EventCardProps {
    task: EventTask;
    /**
     * На чём висит дело — сделка или лид из связей клиента. Не передана или
     * пустая — блок связи не рисуется вовсе.
     */
    relation?: TaskRelation;
    /**
     * Дело одно на экране (встройка в задачу) — комментарию можно отдать
     * больше высоты, прятать в туман тут нечего.
     */
    spacious?: boolean;
    onSelect: (status: EventItemResultType, task: EventTask) => void;
}

/**
 * Карточка дела: применяется, когда дел мало (см. lib/list-view.ts).
 *
 * Тип события окрашивает карточку еле заметной тонировкой фона и рамки от
 * реактивного --event-current (data-event-type) — вместо прежней толстой
 * полосы слева. Статус срока — цветом текста срока, без отдельного бэйджа:
 * во фрейме-миниатюре каждая лишняя заливка складывается в «светофор».
 */
export const EventCard: FC<EventCardProps> = ({
    task,
    relation,
    spacious,
    onSelect,
}) => {
    const comment = task.eventComment;
    const summary = getTaskSummary(task.description);
    const deadline = DEADLINE_VIEW[task.isExpired];
    // Конструктор событий может продублировать комментарий в описание —
    // одинаковый текст дважды только раздувает карточку. Сравниваем обе
    // стороны нормализованными: summary уже прошёл getTaskSummary, а сырой
    // комментарий отличался бы любым переносом строки или двойным пробелом.
    const showSummary =
        Boolean(summary) && (!comment || getTaskSummary(comment) !== summary);
    // Привязанные к задаче сделки — основной полоской под названием;
    // остальные сделки клиента — миниатюрой сбоку от комментария.
    const boundDeals = relation?.deals.filter(deal => deal.isTaskBound) ?? [];
    const extraDeals = relation?.deals.filter(deal => !deal.isTaskBound) ?? [];

    return (
        <Card
            data-event-type={getEventTypeAttr(task.eventType)}
            // Хинт `color:` обязателен: без него tailwind-merge относит
            // border-[...] к группе border-width и выкидывает базовый `border`
            // карточки — рамка исчезала целиком (см. tones.ts).
            className="gap-3 overflow-hidden border-[color:color-mix(in_oklab,var(--event-current),var(--border)_72%)] bg-[color:color-mix(in_oklab,var(--event-current),var(--card)_95%)] py-4"
        >
            <CardHeader className="gap-2 px-4">
                <div className="flex flex-wrap items-center gap-2">
                    <EventTypeBadge
                        type={getEventTypeLabel({
                            eventType: task.eventType,
                            type: task.type,
                            ufCrmTask: task.ufCrmTask,
                        })}
                    />
                    <span
                        className={cn(
                            'ml-auto whitespace-nowrap text-xs',
                            deadline.className,
                        )}
                    >
                        {deadline.prefix}
                        {task.deadline}
                    </span>
                </div>
                {/* Простыни лидогена не раздувают карточку: две строки с
                    многоточием, полное имя — по наведению. */}
                <p
                    title={task.name}
                    className="line-clamp-2 break-words text-base font-medium leading-snug"
                >
                    {task.name}
                </p>
                {/* С кем разговор: контакт из привязок задачи, ссылка в CRM. */}
                <TaskContactChip
                    contactIds={getTaskLinks(task).contactIds}
                    className="mt-0.5"
                />
                {relation && (
                    <RelationMini
                        deals={boundDeals}
                        lead={relation.lead}
                        className="mt-0.5"
                    />
                )}
            </CardHeader>

            {(comment || showSummary || extraDeals.length > 0) && (
                <CardContent className="flex items-start gap-3 px-4">
                    {(comment || showSummary) && (
                        <div className="flex min-w-0 flex-1 flex-col gap-2">
                            {comment && (
                                <FogText text={comment} spacious={spacious} />
                            )}
                            {showSummary && (
                                <FogText text={summary} spacious={spacious} />
                            )}
                        </div>
                    )}
                    {/* Остальные сделки клиента — миниатюрой сбоку от
                        комментария, под основной полоской. */}
                    {extraDeals.length > 0 && (
                        <RelationDealBars
                            deals={extraDeals}
                            className="w-28 shrink-0"
                        />
                    )}
                </CardContent>
            )}

            <CardFooter className="justify-end px-4">
                <EventListActions task={task} onSelect={onSelect} />
            </CardFooter>
        </Card>
    );
};
