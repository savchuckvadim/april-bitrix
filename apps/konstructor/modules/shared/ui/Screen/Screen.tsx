import type { ReactNode } from 'react';
import { cn } from '@workspace/ui/lib/utils';

export type ScreenWidth = 'narrow' | 'default' | 'full';

export interface ScreenProps {
    /** narrow — пустые состояния и короткие выборы, default — рабочие экраны, full — во всю ширину фрейма. */
    width?: ScreenWidth;
    className?: string;
    children: ReactNode;
}

const WIDTH_CLASS: Record<ScreenWidth, string> = {
    narrow: 'max-w-4xl',
    default: 'max-w-screen-2xl',
    full: 'max-w-none',
};

/**
 * Колонка экрана: ширина, поля и шаг между блоками — одни на всё приложение.
 * Фрейм сделки широкий — рабочие экраны занимают его почти целиком.
 */
export const Screen = ({ width = 'default', className, children }: ScreenProps) => (
    <div
        className={cn(
            'mx-auto flex w-full flex-1 flex-col gap-6 px-4 py-6 lg:px-6',
            WIDTH_CLASS[width],
            className,
        )}
    >
        {children}
    </div>
);
