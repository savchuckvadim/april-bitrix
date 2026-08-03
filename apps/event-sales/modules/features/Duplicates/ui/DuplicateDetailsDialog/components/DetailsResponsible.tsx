'use client';

import { FC } from 'react';
import { UserRound } from 'lucide-react';
import type { ResponsibleUser } from '../../../model';

interface DetailsResponsibleProps {
    responsible?: ResponsibleUser;
}

/** С кем клиент уже работает — главный ответ, ради которого открывают карточку. */
export const DetailsResponsible: FC<DetailsResponsibleProps> = ({
    responsible,
}) => {
    if (!responsible) {
        return (
            <p className="text-sm text-muted-foreground">
                Ответственный не определён.
            </p>
        );
    }

    return (
        <p className="flex flex-wrap items-center gap-1.5 text-sm text-foreground">
            <UserRound
                aria-hidden
                className="size-4 shrink-0 text-muted-foreground"
            />
            Ответственный:
            <span className="font-semibold">{responsible.name}</span>
            {responsible.head && (
                <span className="text-xs text-muted-foreground">
                    · руководитель {responsible.head.name}
                </span>
            )}
        </p>
    );
};
