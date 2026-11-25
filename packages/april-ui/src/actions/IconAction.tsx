'use client';

import type { ComponentType, ReactElement, ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@workspace/ui/lib/utils';
import { HintTooltip } from '../Tooltip/HintTooltip';

export type IconActionSize = 'sm' | 'md';

/** ghost — без рамки (строки списков, плотные панели); outline — в рамке (шапки страниц). */
export type IconActionVariant = 'ghost' | 'outline';

export interface IconActionProps {
    /** Иконка lucide-react (или любая, принимающая className). */
    icon: ComponentType<{ className?: string }>;
    /** Что делает кнопка: идёт в aria-label и в заголовок подсказки. */
    label: string;
    /** Подробности под заголовком подсказки. */
    hint?: ReactNode;
    onClick?: () => void;
    /** Адрес вместо действия: путь внутри приложения или внешняя ссылка (см. external). */
    href?: string;
    /** Внешняя ссылка: открывается в новой вкладке. Работает только вместе с href. */
    external?: boolean;
    /** Выключенное состояние; у ссылки (href) не действует. */
    disabled?: boolean;
    /** Нажатое состояние для кнопок-переключателей. */
    pressed?: boolean;
    /** Число в углу — сколько всего стоит за действием; 0 не показывается. */
    count?: number;
    variant?: IconActionVariant;
    size?: IconActionSize;
    side?: 'top' | 'right' | 'bottom' | 'left';
    align?: 'start' | 'center' | 'end';
    className?: string;
    /** Класс самой иконки — например, цвет состояния. */
    iconClassName?: string;
}

const SIZE_CLASS: Record<IconActionSize, string> = {
    sm: 'size-6 [&>svg]:size-3.5',
    md: 'size-8 [&>svg]:size-4',
};

const VARIANT_CLASS: Record<IconActionVariant, string> = {
    ghost: 'text-muted-foreground hover:bg-muted hover:text-foreground',
    outline:
        'border border-input bg-background text-foreground shadow-xs hover:bg-accent hover:text-accent-foreground',
};

/** Больше этого число в углу не пишется — показывается «99+». */
const COUNT_MAX = 99;

/**
 * Иконка-действие: маленькая кнопка без текста с обязательной подсказкой.
 *
 * Обязательной именно потому, что текста нет: иконка без объяснения — загадка,
 * а «глаз» и «карандаш» рядом различаются только смыслом. Подсказка заодно
 * закрывает доступность — тот же текст уходит в aria-label.
 *
 * Годится всюду, где действие второстепенное и не должно спорить с основной
 * кнопкой: строки списков, шапки карточек, плотные панели (вид ghost) и шапки
 * страниц (вид outline). С href это ссылка того же вида: путь приложения
 * открывается на месте, внешний адрес (external) — в новой вкладке.
 */
export const IconAction = ({
    icon: Icon,
    label,
    hint,
    onClick,
    href,
    external = false,
    disabled,
    pressed,
    count = 0,
    variant = 'ghost',
    size = 'sm',
    side = 'top',
    align = 'end',
    className,
    iconClassName,
}: IconActionProps) => {
    const hasCount = count > 0;
    const classes = cn(
        'inline-flex shrink-0 cursor-pointer items-center justify-center rounded-md transition-colors',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
        'disabled:pointer-events-none disabled:opacity-50',
        VARIANT_CLASS[variant],
        pressed && 'bg-muted text-foreground',
        hasCount && 'relative',
        SIZE_CLASS[size],
        className,
    );
    const content = (
        <>
            <Icon className={iconClassName} aria-hidden />
            {hasCount && (
                <span
                    aria-hidden
                    className="pointer-events-none absolute -top-1.5 -right-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] leading-none font-medium text-primary-foreground tabular-nums"
                >
                    {count > COUNT_MAX ? `${COUNT_MAX}+` : count}
                </span>
            )}
        </>
    );

    let control: ReactElement;
    if (href === undefined) {
        control = (
            <button
                type="button"
                onClick={onClick}
                disabled={disabled}
                aria-label={label}
                aria-pressed={pressed}
                className={classes}
            >
                {content}
            </button>
        );
    } else if (external) {
        control = (
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClick}
                aria-label={label}
                className={classes}
            >
                {content}
            </a>
        );
    } else {
        control = (
            <Link
                href={href}
                onClick={onClick}
                aria-label={label}
                className={classes}
            >
                {content}
            </Link>
        );
    }

    return (
        <HintTooltip
            title={label}
            lines={hint ? [hint] : []}
            side={side}
            align={align}
        >
            {control}
        </HintTooltip>
    );
};
