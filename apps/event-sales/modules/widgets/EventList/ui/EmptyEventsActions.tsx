'use client';

import { FC } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import { useAppDispatch } from '@/modules/app/lib/hooks/redux';
import {
    EventItemResultType,
    getResultMenu,
} from '@/modules/widgets/EventItem';
import { QuickOutcomeLargeButtons } from '@/modules/widgets/QuickOutcome';
import { useEventNavigation } from '@/modules/processes/event';

/**
 * Кнопки пустого списка: крупнее кнопок шапки и прозрачнее — фон почти не
 * виден, цвет несёт подпись (владелец, 06.10.2026). Без размытия: во фреймах
 * «Звонков» стекла нет.
 */
const EMPTY_ACTION_CLASS =
    'h-9 px-4 bg-transparent border-border/60 hover:bg-muted/40';

/**
 * Дел нет — на месте списка те же действия, что в шапке: «Создать»,
 * «Отказ», «Продажа». Продажа и отказ — итог: следующее событие при них не
 * планируется никогда.
 */
export const EmptyEventsActions: FC = () => {
    const dispatch = useAppDispatch();
    const nav = useEventNavigation();

    const createNewEvent = async () => {
        await dispatch(getResultMenu(EventItemResultType.NEW, null));
        nav.toItem();
    };

    return (
        <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
                Открытых событий нет.
            </p>
            <div className="flex flex-wrap gap-2">
                <Button
                    variant="outline"
                    className={cn(
                        EMPTY_ACTION_CLASS,
                        'text-primary hover:text-primary',
                    )}
                    onClick={createNewEvent}
                >
                    <Plus aria-hidden className="size-4" />
                    Создать
                </Button>
                <QuickOutcomeLargeButtons className={EMPTY_ACTION_CLASS} />
            </div>
        </div>
    );
};
