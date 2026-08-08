'use client';

import { FC } from 'react';
import { Plus, RefreshCcw } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { ThemeTogglePanel } from '@workspace/theme';
import { useAppDispatch } from '@/modules/app/lib/hooks/redux';
import { useReload } from '@/modules/app/lib/hooks/app';
import { getResultMenu, EventItemResultType } from '@/modules/widgets/EventItem';
import { useEventNavigation } from '@/modules/processes/event';
import { ResultStatistics } from '@/modules/features/ResultStatistics';
import { DepartmentMode } from '@/modules/features/Departament';
import { ClientBar } from '@/modules/entities/EventCompany';
import { EntityLink, useCurrentRelations } from '@/modules/entities/RelatedCrm';
import { InnControl } from '@/modules/features/Inn';
import { SignalsControl } from '@/modules/features/ClientSignals';

/**
 * Шапка списка дел — ОДНА тонкая строка: кто открыт, прогноз/статус, точки
 * связи и ИНН, справа действия. Приложение живёт во фрейме-миниатюре
 * (630×600), и каждая строка шапки — минус одна карточка дела на экране,
 * поэтому здесь ничего не разворачивается: списки телефонов, email и
 * вариантов ИНН показываются тултипами по наведению.
 */
export const EventListHeader: FC = () => {
    const dispatch = useAppDispatch();
    const { reload } = useReload();
    const nav = useEventNavigation();
    // enabled=false: здесь нужен только descriptor, связи шапка не показывает.
    const { descriptor } = useCurrentRelations(false);

    const createNewEvent = async () => {
        await dispatch(getResultMenu(EventItemResultType.NEW, null));
        nav.toItem();
    };

    return (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 py-1.5">
            <button
                type="button"
                onClick={reload}
                className="shrink-0 cursor-pointer rounded-md p-0.5 text-muted-foreground transition-transform hover:text-foreground active:scale-90"
                aria-label="Обновить"
            >
                <RefreshCcw size={14} />
            </button>

            {descriptor && (
                <EntityLink
                    descriptor={descriptor}
                    className="min-w-0 max-w-56 text-xs font-medium"
                />
            )}

            <ClientBar className="min-w-0" compact />
            <InnControl compact />
            <SignalsControl compact />

            <div className="ml-auto flex shrink-0 items-center gap-2">
                <ResultStatistics />
                <DepartmentMode />
                <Button
                    size="sm"
                    className="h-6 gap-1 px-2 text-xs"
                    onClick={createNewEvent}
                >
                    <Plus aria-hidden className="size-3" />
                    создать
                </Button>
                <ThemeTogglePanel />
            </div>
        </div>
    );
};
