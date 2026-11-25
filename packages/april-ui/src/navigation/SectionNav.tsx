'use client';

import { cn } from '@workspace/ui/lib/utils';

export interface SectionNavItem {
    code: string;
    label: string;
    /** Пояснение под названием; на узком экране скрыто. */
    description?: string;
}

export interface SectionNavProps {
    items: readonly SectionNavItem[];
    /** Код открытого раздела. */
    current: string;
    onSelect: (code: string) => void;
    ariaLabel?: string;
    className?: string;
}

/**
 * Навигация по разделам страницы: список слева от содержимого, на узком
 * экране — ряд кнопок над ним (прокручивается вбок, пояснения скрыты).
 *
 * Разделы — экраны одной страницы, а не маршруты: адресов компонент не знает,
 * переключение делает вызывающий в `onSelect`. Открытый раздел помечен
 * `aria-current="page"`. Для шагов мастера есть {@link StepNav}.
 */
export const SectionNav = ({
    items,
    current,
    onSelect,
    ariaLabel = 'Разделы',
    className,
}: SectionNavProps) => (
    <nav aria-label={ariaLabel} className={cn('min-w-0', className)}>
        <ul className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
            {items.map(item => {
                const active = item.code === current;
                return (
                    <li key={item.code} className="shrink-0 md:shrink">
                        <button
                            type="button"
                            aria-current={active ? 'page' : undefined}
                            onClick={() => onSelect(item.code)}
                            className={cn(
                                'flex w-full cursor-pointer flex-col items-start gap-0.5 rounded-md px-3 py-2 text-left text-sm transition-colors',
                                'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                                active
                                    ? 'bg-accent font-medium text-accent-foreground'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                            )}
                        >
                            <span className="whitespace-nowrap md:whitespace-normal">
                                {item.label}
                            </span>
                            {item.description && (
                                <span className="hidden text-xs font-normal text-muted-foreground md:block">
                                    {item.description}
                                </span>
                            )}
                        </button>
                    </li>
                );
            })}
        </ul>
    </nav>
);
