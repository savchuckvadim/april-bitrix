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
import { ClientBar } from '@/modules/entities/EventCompany';
import { EntityLink, useCurrentRelations } from '@/modules/entities/RelatedCrm';
import { InnControl } from '@/modules/features/Inn';
import { SignalsControl } from '@/modules/features/ClientSignals';

/** Шапка списка: текущий клиент, обновление, статистика, режим отдела, создание события. */
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
        <div className="space-y-2 py-2">
            <div className="flex items-center justify-between gap-2">
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

            {/* Кто открыт — ссылкой на карточку CRM: во фрейме задачи это
                единственный путь к полноценной карточке клиента. */}
            {descriptor && (
                <div className="flex min-w-0 items-center gap-2">
                    <span className="shrink-0 text-xs text-muted-foreground">
                        {descriptor.kindLabel}
                    </span>
                    <EntityLink
                        descriptor={descriptor}
                        className="text-sm font-medium"
                    />
                </div>
            )}

            {/* Прогноз, статус клиента и ИНН — над событиями: их правят и не
                открывая отчёт. */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <ClientBar className="min-w-0" />
                <InnControl />
                <SignalsControl />
            </div>
        </div>
    );
};
