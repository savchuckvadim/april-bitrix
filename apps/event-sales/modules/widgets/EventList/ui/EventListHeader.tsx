'use client';

import { FC } from 'react';
import { RefreshCcw } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { ThemeTogglePanel } from '@workspace/theme';
import { useAppDispatch } from '@/modules/app/lib/hooks/redux';
import { useReload } from '@/modules/app/lib/hooks/app';
import { getResultMenu, EventItemResultType } from '@/modules/widgets/EventItem';
import { useEventNavigation } from '@/modules/processes/event';
import { ResultStatistics } from '@/modules/features/ResultStatistics';
import { DepartmentMode } from '@/modules/features/Departament';

/** Шапка списка: обновление, статистика результатов, режим отдела, создание события. */
export const EventListHeader: FC = () => {
    const dispatch = useAppDispatch();
    const { reload } = useReload();
    const nav = useEventNavigation();

    const createNewEvent = async () => {
        await dispatch(getResultMenu(EventItemResultType.NEW, null));
        nav.toItem();
    };

    return (
        <div className="flex items-center justify-between gap-2 py-2">
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={reload}
                    className="cursor-pointer rounded-md p-1 text-muted-foreground transition-transform hover:text-foreground active:scale-90"
                    aria-label="Обновить"
                >
                    <RefreshCcw size={16} />
                </button>
                <ResultStatistics />
                <ThemeTogglePanel />
            </div>

            <div className="flex items-center gap-3">
                <DepartmentMode />
                <Button size="sm" onClick={createNewEvent}>
                    + создать
                </Button>
            </div>
        </div>
    );
};
