'use client';

import { useState } from 'react';
import type { FC } from 'react';
import { CalendarPlus, ListTodo, Play } from 'lucide-react';
import { GlassCard } from '@workspace/april-ui';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import {
    findEventType,
    SIM_FOREIGN_TASKS,
    SIM_PLANNABLE_EVENTS,
} from '../../constants/sim-events';
import type { SimTask } from '../../lib/simulator.util';

interface SimTaskListProps {
    tasks: SimTask[];
    /** Компания, которую ведём в симуляторе. */
    company: string;
    onOpen: (taskId: string) => void;
    onAdd: (eventCode: string) => void;
}

/** Точка в цвете типа события — тот же приём, что в форме. */
const EventDot: FC<{ eventCode: string }> = ({ eventCode }) => (
    <span
        data-event-type={findEventType(eventCode)?.dataEventType ?? 'warm'}
        aria-hidden
        className="size-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: 'var(--event-current)' }}
    />
);

/**
 * Список запланированных дел — первый экран приложения «Звонки».
 *
 * Менеджер попадает сюда после каждой отправки: отсюда он либо отчитывается по
 * делу, либо планирует новое, не отчитываясь. Дел может быть несколько сразу —
 * поэтому это список, а не одна карточка.
 */
export const SimTaskList: FC<SimTaskListProps> = ({
    tasks,
    company,
    onOpen,
    onAdd,
}) => {
    const [isAdding, setIsAdding] = useState(false);

    return (
        <GlassCard intensity="soft" className="rounded-2xl border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-foreground flex items-center gap-2 font-bold">
                    <ListTodo className="text-primary size-4" aria-hidden />
                    Ваши дела
                    <span className="text-muted-foreground text-sm font-normal">
                        {`— ${tasks.length + SIM_FOREIGN_TASKS.length} на сегодня`}
                    </span>
                </h3>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAdding(current => !current)}
                    className="gap-1.5"
                >
                    <CalendarPlus className="size-4" />
                    Запланировать дело
                </Button>
            </div>

            {isAdding && (
                <div className="border-primary/40 mt-3 rounded-xl border border-dashed p-3">
                    <p className="text-muted-foreground text-xs">
                        Планировать можно и не отчитываясь — например, когда
                        договорились о следующем шаге вне звонка. Холодного
                        звонка тут нет: его ставит хук ХО, а не менеджер.
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                        {SIM_PLANNABLE_EVENTS.map(event => (
                            <button
                                key={event.code}
                                type="button"
                                title={event.hint}
                                onClick={() => {
                                    onAdd(event.code);
                                    setIsAdding(false);
                                }}
                                className="hover:border-primary hover:text-primary text-muted-foreground focus-visible:outline-primary cursor-pointer rounded-full border px-3 py-1.5 text-xs transition-colors focus-visible:outline-2"
                            >
                                {event.emoji && `${event.emoji} `}
                                {event.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {tasks.length === 0 ? (
                <p className="text-muted-foreground mt-3 rounded-xl border border-dashed p-4 text-xs">
                    Дел не осталось. Пока их нет, система не создаст ни задачи,
                    ни события KPI — запланируйте следующий шаг.
                </p>
            ) : (
                <ul className="mt-3 space-y-1.5">
                    {tasks.map(task => (
                        <li key={task.id}>
                            <button
                                type="button"
                                onClick={() => onOpen(task.id)}
                                className={cn(
                                    'bg-card hover:border-primary focus-visible:outline-primary flex w-full cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors focus-visible:outline-2',
                                    task.isImportant && 'border-action/50',
                                )}
                            >
                                <EventDot eventCode={task.eventCode} />

                                <span className="min-w-0 flex-1">
                                    <span className="text-foreground block truncate text-sm font-semibold">
                                        {task.title}
                                    </span>
                                    <span className="text-muted-foreground block truncate text-[11px]">
                                        {company}
                                        {task.deadline && ` · ${task.deadline}`}
                                    </span>
                                </span>

                                {task.isImportant && (
                                    <span className="text-action shrink-0 text-[10px] font-bold tracking-wide uppercase">
                                        важное
                                    </span>
                                )}

                                <span className="text-primary flex shrink-0 items-center gap-1 text-xs font-semibold">
                                    <Play className="size-3.5" aria-hidden />
                                    Отчитаться
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            <p className="text-muted-foreground mt-4 text-[11px] font-bold tracking-widest uppercase">
                Остальные клиенты дня
            </p>
            <ul className="mt-1.5 space-y-1">
                {SIM_FOREIGN_TASKS.map(task => (
                    <li
                        key={task.id}
                        className="flex items-center gap-3 rounded-lg border border-dashed px-3 py-2 opacity-60"
                    >
                        <EventDot eventCode={task.eventCode} />
                        <span className="min-w-0 flex-1">
                            <span className="text-foreground block truncate text-xs">
                                {task.title}
                            </span>
                            <span className="text-muted-foreground block truncate text-[11px]">
                                {task.company} · {task.deadline}
                            </span>
                        </span>
                    </li>
                ))}
            </ul>
            <p className="text-muted-foreground mt-2 text-[11px] leading-relaxed">
                Эти дела в симуляторе не открываются — они здесь, чтобы было
                видно масштаб: ваш клиент у менеджера не один, и каждое дело
                стоит внимания.
            </p>
        </GlassCard>
    );
};
