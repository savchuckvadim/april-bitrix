'use client';

import { FC } from 'react';
import { Link2 } from 'lucide-react';
import { ETaskLinkType } from '@/modules/entities/EventTask/lib/task-links';
import { useTaskRelatedLinks } from '../../lib/hooks/use-task-related-links';

const TYPE_LABEL = {
    [ETaskLinkType.COMPANY]: 'комп.',
    [ETaskLinkType.DEAL]: 'сдел.',
    [ETaskLinkType.LEAD]: 'лид.',
    [ETaskLinkType.CONTACT]: 'конт.',
} as const;

/**
 * Бледный счётчик остальных CRM-связей текущей задачи: работаем в приоритетной
 * сущности, но рядом видно, что у задачи есть ещё связи (лиды, сделки,
 * контакты). Нет связей — нет и элемента.
 */
export const RelatedLinksBadge: FC = () => {
    const { others } = useTaskRelatedLinks();
    if (!others.length) return null;

    const byType = others.reduce<Record<string, number>>((acc, ref) => {
        acc[ref.type] = (acc[ref.type] ?? 0) + 1;
        return acc;
    }, {});
    const breakdown = Object.entries(byType)
        .map(
            ([type, count]) =>
                `${count} ${TYPE_LABEL[type as keyof typeof TYPE_LABEL] ?? type}`,
        )
        .join(', ');

    return (
        <span
            className="inline-flex items-center gap-1 text-xs text-muted-foreground/70"
            title={`Ещё связи задачи: ${breakdown}`}
        >
            <Link2 aria-hidden className="size-3 shrink-0" />
            +{others.length}
        </span>
    );
};
