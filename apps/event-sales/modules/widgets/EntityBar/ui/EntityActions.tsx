'use client';

import { FC } from 'react';
import { usePathname } from 'next/navigation';
import { Plus, RefreshCcw } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { ThemeTogglePanel } from '@workspace/theme';
import { useAppDispatch } from '@/modules/app/lib/hooks/redux';
import { useReload } from '@/modules/app/lib/hooks/app';
import { FrameTopButton } from '@/modules/app/ui/FrameTopButton';
import { useEventNavigation } from '@/modules/processes/event';
import { EVENT_ROUTE_PATH, ROUTE_EVENT } from '@/modules/processes/event';
import { DepartmentMode } from '@/modules/features/Departament';
import { ResultStatistics } from '@/modules/features/ResultStatistics';
import {
    EventItemResultType,
    getResultMenu,
} from '@/modules/widgets/EventItem';

/**
 * Действия приложения в правом верхнем углу общей шапки: обновить,
 * режим отдела, статистика, «создать», возврат к фрейму, темы.
 * Отдельных строк действий на экранах больше нет (решение владельца) —
 * один угол на всё приложение.
 *
 * «Создать» скрыта на экране дела: там открыта форма, и сброс её
 * новым событием по соседней кнопке был бы миной.
 */
export const EntityActions: FC = () => {
    const dispatch = useAppDispatch();
    const { reload } = useReload();
    const nav = useEventNavigation();
    const pathname = usePathname();
    const isItemScreen = pathname === EVENT_ROUTE_PATH[ROUTE_EVENT.ITEM];

    const createNewEvent = async () => {
        await dispatch(getResultMenu(EventItemResultType.NEW, null));
        nav.toItem();
    };

    return (
        <div className="ml-auto flex shrink-0 items-center gap-2">
            <DepartmentMode />
            <ResultStatistics />
            {!isItemScreen && (
                <Button
                    size="sm"
                    className="h-6 gap-1 px-2 text-xs"
                    onClick={createNewEvent}
                >
                    <Plus aria-hidden className="size-3" />
                    создать
                </Button>
            )}
            {/* Обновление — ПОСЛЕ «создать» и перед служебными кнопками:
                это редкое действие-починка, ему не место первым в строке. */}
            <button
                type="button"
                onClick={reload}
                className="shrink-0 cursor-pointer rounded-md p-0.5 text-muted-foreground transition-transform hover:text-foreground active:scale-90"
                aria-label="Обновить"
            >
                <RefreshCcw size={14} />
            </button>
            <FrameTopButton />
            <ThemeTogglePanel />
        </div>
    );
};
