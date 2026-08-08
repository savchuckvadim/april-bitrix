'use client';

import { FC } from 'react';
import { Badge } from '@workspace/ui/components/badge';
import type { ResponsibleUser } from '@/modules/entities/RelatedCrm';
import { ClientBar } from '@/modules/entities/EventCompany';
import { EntityLink } from '@/modules/entities/RelatedCrm';
import { InnControl } from '@/modules/features/Inn';
import { SignalsControl } from '@/modules/features/ClientSignals';
import type { EntityDescriptor } from '@/modules/entities/RelatedCrm';
import { EventListHeader } from '../../EventList';
import { DepartmentMode } from '@/modules/features/Departament';
import { Button } from '@workspace/ui/components/button';
import { useEventNavigation } from '@/modules/processes/event';
import { useAppDispatch } from '@/modules/app';
import { useCompactUi } from '@/modules/app/lib/hooks/use-compact-ui';
import { EventItemResultType, getResultMenu } from '../../EventItem';
import { ResultStatistics } from '@/modules/features/ResultStatistics';
import { ThemeTogglePanel } from '@workspace/theme';

interface EntityBoardHeaderProps {
    descriptor: EntityDescriptor;
    responsible?: ResponsibleUser;
}

/** Шапка экрана: что за сущность, как называется, за кем закреплена. */
export const EntityBoardHeader: FC<EntityBoardHeaderProps> = ({
    descriptor,
    responsible,
}) => {
    const dispatch = useAppDispatch();

    const nav = useEventNavigation();
    const isCompact = useCompactUi();

    const createNewEvent = () => {
        dispatch(getResultMenu(EventItemResultType.NEW, null));
        nav.toItem();
    };

    return <header className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <Badge variant="secondary" className="shrink-0">
            {descriptor.kindLabel}
        </Badge>

        <h1 className="flex min-w-0 flex-1 text-lg font-semibold text-foreground">
            <EntityLink descriptor={descriptor} />
        </h1>

        {responsible?.name || (
            <span className="shrink-0 text-sm text-muted-foreground">
                {responsible?.name || 'Ответственный не задан'}
            </span>
        )}

        <div className="flex items-center gap-3">
            <DepartmentMode />

            <ResultStatistics />

            {/* TODO вынести в процесс пушпроцесс баттон */}
            <Button size="sm" onClick={createNewEvent}>
                + создать
            </Button>
            <ThemeTogglePanel />
        </div>

        {/* Та же полоска, что над списком и в шапке отчёта: прогноз, статус
            клиента и ИНН живут одними компонентами на всех трёх экранах. */}
        <div className="flex basis-full flex-wrap items-center gap-x-4 gap-y-1">
            <ClientBar className="min-w-0" compact={isCompact} />
            <InnControl compact={isCompact} />
            <SignalsControl compact={isCompact} />
        </div>
    </header >

};
