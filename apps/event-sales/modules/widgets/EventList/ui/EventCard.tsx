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
import { EventTask } from '@/modules/entities/EventTask/types/event-task-type';
import { getEventTypeAttr } from '@/modules/entities/EventTask/lib/event-type-token';
import { getTaskSummary } from '@/modules/entities/EventTask/lib/task-util';
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
export const EventCard: FC<EventCardProps> = ({ task, relation, onSelect }) => {
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
                    <EventTypeBadge type={task.type} />
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
                <p className="text-base font-medium leading-snug">{task.name}</p>
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
                            {comment && <FogText text={comment} />}
                            {showSummary && <FogText text={summary} />}
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
