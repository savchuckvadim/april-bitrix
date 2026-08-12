'use client';

import type { ReactNode } from 'react';
import { cn } from '@workspace/ui/lib/utils';

export interface MicroFieldProps {
    /** Короткая подпись слева от контрола. */
    label?: string;
    /** Обязательное поле: подпись помечается точкой и краснеет пустой. */
    required?: boolean;
    /** Не заполнено, хотя обязательно — подсветить. */
    invalid?: boolean;
    children: ReactNode;
    className?: string;
}

/**
 * Обёртка микро-контрола «пульта»: подпись + сам контрол в одну строку.
 *
 * Пульт собирает ВСЕ отметки отчёта (статус, причины, прогноз, стадии) в
 * одну полосу одного размера. Раньше каждый селект жил своей карточкой и
 * своим кеглем: рядом с плотной колонкой плана это выглядело россыпью, а
 * блок с единственной крупной кнопкой статуса занимал экран впустую.
 */
export const MicroField = ({
    label,
    required,
    invalid,
    children,
    className,
}: MicroFieldProps) => (
    <div className={cn('inline-flex items-center gap-1.5', className)}>
        {label && (
            <span
                className={cn(
                    'whitespace-nowrap text-[0.65rem] leading-none',
                    invalid
                        ? 'font-semibold text-destructive'
                        : 'text-muted-foreground',
                )}
            >
                {required && <span aria-hidden>• </span>}
                {label}
            </span>
        )}
        {children}
    </div>
);
