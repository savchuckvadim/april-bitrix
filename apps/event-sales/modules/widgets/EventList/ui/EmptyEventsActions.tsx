'use client';

import { FC } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { useAppDispatch } from '@/modules/app/lib/hooks/redux';
import {
    EventItemResultType,
    getResultMenu,
} from '@/modules/widgets/EventItem';
import { QuickOutcomeLargeButtons } from '@/modules/widgets/QuickOutcome';
import { useEventNavigation } from '@/modules/processes/event';

/**
 * Дел нет — на месте списка три действия (владелец, 06.10.2026):
 * продолжить работу новым событием, продажа или отказ.
 *
 * Продажа и отказ — итог: следующее событие при них не планируется никогда.
 */
export const EmptyEventsActions: FC = () => {
    const dispatch = useAppDispatch();
    const nav = useEventNavigation();

    const createNewEvent = async () => {
        await dispatch(getResultMenu(EventItemResultType.NEW, null));
        nav.toItem();
    };

    return (
        <div className="space-y-3 rounded-md border border-dashed border-border p-4 text-center">
            <p className="text-sm text-muted-foreground">
                Открытых событий нет. Что дальше с клиентом?
            </p>
            <div className="flex flex-wrap justify-center gap-2">
                <Button onClick={createNewEvent}>
                    <Plus aria-hidden className="size-4" />
                    Создать — продолжить работу
                </Button>
                <QuickOutcomeLargeButtons />
            </div>
            <p className="text-xs text-muted-foreground">
                Продажа и отказ завершают работу с клиентом — следующее
                событие не планируется.
            </p>
        </div>
    );
};
