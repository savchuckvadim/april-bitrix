'use client';

import type { ComponentType, ReactNode } from 'react';
import { cn } from '@workspace/ui/lib/utils';
import { HintTooltip } from '../Tooltip/HintTooltip';

export type IconActionSize = 'sm' | 'md';

export interface IconActionProps {
    /** Иконка lucide-react (или любая, принимающая className). */
    icon: ComponentType<{ className?: string }>;
    /** Что делает кнопка: идёт в aria-label и в заголовок подсказки. */
    label: string;
    /** Подробности под заголовком подсказки. */
    hint?: ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    /** Нажатое состояние для кнопок-переключателей. */
    pressed?: boolean;
    size?: IconActionSize;
    side?: 'top' | 'right' | 'bottom' | 'left';
    align?: 'start' | 'center' | 'end';
    className?: string;
}

const SIZE_CLASS: Record<IconActionSize, string> = {
    sm: 'size-6 [&>svg]:size-3.5',
    md: 'size-8 [&>svg]:size-4',
};

/**
 * Иконка-действие: маленькая кнопка без текста с обязательной подсказкой.
 *
 * Обязательной именно потому, что текста нет: иконка без объяснения — загадка,
 * а «глаз» и «карандаш» рядом различаются только смыслом. Подсказка заодно
 * закрывает доступность — тот же текст уходит в aria-label.
 *
 * Годится всюду, где действие второстепенное и не должно спорить с основной
 * кнопкой: строки списков, шапки карточек, плотные панели.
 */
export const IconAction = ({
    icon: Icon,
    label,
    hint,
    onClick,
    disabled,
    pressed,
    size = 'sm',
    side = 'top',
    align = 'end',
    className,
}: IconActionProps) => (
    <HintTooltip
        title={label}
        lines={hint ? [hint] : []}
        side={side}
        align={align}
    >
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            aria-pressed={pressed}
            className={cn(
                'inline-flex shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors',
                'hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                'disabled:pointer-events-none disabled:opacity-50',
                pressed && 'bg-muted text-foreground',
                SIZE_CLASS[size],
                className,
            )}
        >
            <Icon aria-hidden />
        </button>
    </HintTooltip>
);
