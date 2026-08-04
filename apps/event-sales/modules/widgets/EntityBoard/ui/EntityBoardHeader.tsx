'use client';

import { FC } from 'react';
import { Badge } from '@workspace/ui/components/badge';
import type { ResponsibleUser } from '@/modules/entities/RelatedCrm';
import { ClientBar } from '@/modules/entities/EventCompany';
import type { EntityDescriptor } from '@/modules/entities/RelatedCrm';

interface EntityBoardHeaderProps {
    descriptor: EntityDescriptor;
    responsible?: ResponsibleUser;
}

/** Шапка экрана: что за сущность, как называется, за кем закреплена. */
export const EntityBoardHeader: FC<EntityBoardHeaderProps> = ({
    descriptor,
    responsible,
}) => (
    <header className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <Badge variant="secondary" className="shrink-0">
            {descriptor.kindLabel}
        </Badge>

        <h1 className="min-w-0 flex-1 truncate text-lg font-semibold text-foreground">
            {descriptor.title}
        </h1>

        {responsible?.name && (
            <span className="shrink-0 text-sm text-muted-foreground">
                {responsible.name}
            </span>
        )}

        {/* Та же полоска, что над списком и в шапке отчёта: прогноз и статус
            клиента живут одним компонентом на всех трёх экранах. */}
        <ClientBar className="basis-full" />
    </header>
);
