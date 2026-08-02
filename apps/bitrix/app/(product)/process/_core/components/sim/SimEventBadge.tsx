import type { FC } from 'react';
import { cn } from '@workspace/ui/lib/utils';

/**
 * Бэйдж типа события в его собственном цвете.
 *
 * Цвет не задаётся здесь: бэйдж берёт var(--event-current), а ту переопределяет
 * data-event-type на ближайшем контейнере — ровно как в приложении «Звонки».
 * Поэтому один и тот же компонент выглядит по-разному в зоне отчёта и в зоне
 * плана, если там разные типы событий.
 */
export const SimEventBadge: FC<{ label: string; className?: string }> = ({
    label,
    className,
}) => (
    <span
        className={cn(
            'rounded-md px-2 py-0.5 text-xs font-bold tracking-wide uppercase',
            className,
        )}
        style={{
            backgroundColor: 'var(--event-current)',
            color: 'var(--event-current-foreground)',
        }}
    >
        {label}
    </span>
);
