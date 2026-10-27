'use client';

import { FC, useState } from 'react';
import { Tags } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@workspace/ui/components/popover';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    composeEventTitle,
    selectClientName,
    selectTitleBadges,
} from '@/modules/entities/BadgeCatalog';
import { EV_PLAN_PROP, eventPlanActions } from '@/modules/entities/EventPlan';

/**
 * Готовые названия события — за маленькой кнопкой рядом с полем.
 *
 * На виду их нет: в колонке планирования тесно, а имя клиента в название
 * ставится само при выборе типа (слово типа добавит заголовок задачи). Здесь
 * — уточнения под тип: «Выслать КП», «Созвон с руководителем». Выбрал —
 * список закрылся, название стало «<уточнение> — <клиент>» (решение
 * владельца 27.10.2026). Наведение не используется: менеджеры работают с
 * планшета.
 */
export const TitleBadgesButton: FC = () => {
    const dispatch = useAppDispatch();
    const badges = useAppSelector(selectTitleBadges);
    const clientName = useAppSelector(selectClientName);
    const [open, setOpen] = useState(false);

    if (!badges.length) return null;

    const apply = (text: string) => {
        dispatch(
            eventPlanActions.setPlanProp({
                name: EV_PLAN_PROP.NAME,
                value: composeEventTitle(text, clientName),
            }),
        );
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-9 shrink-0"
                    aria-label="Готовые названия"
                    title="Готовые названия"
                >
                    <Tags aria-hidden className="size-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-64 p-2">
                <p className="mb-1.5 text-[0.6875rem] font-medium text-muted-foreground">
                    Готовые названия
                </p>
                <div role="group" aria-label="Готовые названия" className="flex flex-wrap gap-1">
                    {badges.map(badge => (
                        <button
                            key={badge.code}
                            type="button"
                            onClick={() => apply(badge.text)}
                            className="rounded-md border border-input bg-background px-2 py-0.5 text-xs text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring/50 outline-none focus-visible:ring-[3px]"
                        >
                            {badge.text}
                        </button>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
};
