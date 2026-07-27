'use client';

import { cn } from '@workspace/ui/lib/utils';

/**
 * Перспектива компании (pbx-поле op_prospects) как цветовое обозначение
 * статуса: цветная точка + опциональный лейбл. Заменяет старый бэйдж с
 * динамическими `bg-${color}-400` классами (не переживали Tailwind-purge
 * и выглядели грубо). Карты — СТАТИЧЕСКИЕ (полные классы).
 *
 * Переиспользуется в user report и в финансовом отчёте.
 */
export type CompanyPerspectiveColor =
    | 'green'
    | 'yellow'
    | 'red'
    | 'blue'
    | 'purple'
    | 'orange'
    | 'pink'
    | 'brown'
    | 'gray'
    | 'black'
    | 'white'
    | string;

// Светофор перспективы — семантические токены монорепы (адаптивны к темам,
// совпадают с --success/--warning/--destructive везде). Остальные цвета —
// точечные литералы (перспектива может нести и произвольный цвет портала).
const DOT_CLASS: Record<string, string> = {
    green: 'bg-success',
    yellow: 'bg-warning',
    red: 'bg-destructive',
    blue: 'bg-sky-500',
    purple: 'bg-violet-500',
    orange: 'bg-orange-500',
    pink: 'bg-pink-500',
    brown: 'bg-amber-800',
    gray: 'bg-gray-400',
    black: 'bg-gray-900',
    white: 'bg-gray-200',
};

const LABEL: Record<string, string> = {
    green: 'горячий',
    yellow: 'средний',
    red: 'холодный',
    blue: 'синий',
    purple: 'фиолетовый',
    orange: 'оранжевый',
    pink: 'розовый',
    brown: 'коричневый',
    gray: 'серый',
    black: 'чёрный',
    white: 'белый',
};

/** Русский лейбл перспективы (для CSV/подписей). */
export const companyColorLabel = (color: string | null | undefined): string =>
    color ? (LABEL[color] ?? color) : 'не установлена';

interface CompanyColorBadgeProps {
    color: string | null | undefined;
    /** Показывать текстовый лейбл рядом с точкой. */
    withLabel?: boolean;
    className?: string;
}

export const CompanyColorBadge = ({
    color,
    withLabel = false,
    className,
}: CompanyColorBadgeProps) => {
    const dot = color ? (DOT_CLASS[color] ?? 'bg-gray-300') : 'bg-gray-200';
    return (
        <span
            className={cn('inline-flex items-center gap-1.5', className)}
            title={`Перспектива: ${companyColorLabel(color)}`}
        >
            <span
                className={cn(
                    'h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-black/10',
                    dot,
                )}
            />
            {withLabel && (
                <span className="text-xs text-muted-foreground">
                    {companyColorLabel(color)}
                </span>
            )}
        </span>
    );
};
