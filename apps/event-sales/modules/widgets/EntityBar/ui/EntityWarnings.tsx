'use client';

import { FC } from 'react';
import type { EntityWarning } from '../lib/hooks/use-entity-warnings';
import {
    EntityWarningPill,
    type EntityWarningHandlers,
} from './EntityWarningPill';

interface EntityWarningsProps {
    warnings: EntityWarning[];
    /**
     * Обработчики действий. Не все действия обязаны быть реализованы —
     * без обработчика предупреждение показывается как обычный текст.
     */
    handlers?: EntityWarningHandlers;
}

/**
 * СТАТИЧНАЯ строка предупреждений — вариант «про запас» (todo2508 №6).
 *
 * Сейчас в шапке НЕ смонтирована: предупреждения показывает всплывашка у
 * названия (EntityWarningsFloat). Владелец размышлял, что в высоком хедере
 * может появиться место «чтобы не пусто было» — тогда эта строка включается
 * одной строчкой в EntityHeader (та же пилюля EntityWarningPill, двух
 * конкурирующих показов одного предупреждения не будет — включать вместо
 * всплывашки, не рядом).
 */
export const EntityWarnings: FC<EntityWarningsProps> = ({
    warnings,
    handlers,
}) => {
    if (!warnings.length) return null;

    return (
        <ul className="flex flex-wrap gap-1.5">
            {warnings.map(warning => (
                <li key={warning.id}>
                    <EntityWarningPill warning={warning} handlers={handlers} />
                </li>
            ))}
        </ul>
    );
};
