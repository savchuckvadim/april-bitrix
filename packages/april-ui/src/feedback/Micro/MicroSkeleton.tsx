'use client';

import { cn } from '@workspace/ui/lib/utils';
import { TIMER_GRADIENT } from '../Processing/processing-fx';

export interface MicroSkeletonProps {
    /** Размеры задаёт вызывающий: h-* w-* под свой инпут/бэйдж/кнопку. */
    className?: string;
    /** Палитра блика; по умолчанию — фирменная «продажи» (как у таймера отчёта). */
    gradient?: string[];
}

/**
 * Микро-скелетон: прямой прямоугольник под ОДИН элемент — инпут, бэйдж,
 * микро-кнопку. Для pbx-полей и всего, что грузится/обновляется отдельно
 * от экрана. По приглушённой подложке пробегает градиентный блик фирменной
 * палитры (анимация та же, что у переливания стадийных полосок).
 */
export const MicroSkeleton = ({
    className,
    gradient = TIMER_GRADIENT,
}: MicroSkeletonProps) => (
    <span
        aria-hidden
        className={cn(
            'block h-4 w-full animate-stage-sheen rounded-sm bg-muted bg-[length:240%_100%] motion-reduce:animate-none',
            className,
        )}
        style={{
            backgroundImage: `linear-gradient(100deg, transparent 30%, ${gradient[0]}38 45%, ${gradient[2] ?? gradient[0]}45 55%, transparent 70%)`,
        }}
    />
);
