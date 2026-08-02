'use client';

import type { ReactNode } from 'react';
import { Dialog, DialogContent } from '@workspace/ui/components/dialog';
import { cn } from '@workspace/ui/lib/utils';
import { GlassCard } from '../../shared/ui/Glass/GlassCard';

export type GlassDialogSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type GlassDialogOverlay = 'blur' | 'dim';

/** Ширины подобраны по реальным окнам монорепы, а не «на глазок». */
const SIZE_CLASS: Record<GlassDialogSize, string> = {
    xs: 'w-[min(94vw,26rem)]',
    sm: 'w-[min(94vw,28rem)]',
    md: 'w-[min(96vw,52rem)]',
    lg: 'w-[min(96vw,56rem)]',
    xl: 'w-[min(96vw,64rem)]',
};

const OVERLAY_CLASS: Record<GlassDialogOverlay, string> = {
    blur: 'bg-black/20 backdrop-blur-md',
    dim: 'bg-black/30 backdrop-blur-sm',
};

/**
 * Окно должно быть полностью прозрачным: всю поверхность рисует GlassCard
 * внутри. Иначе под стеклом окажется вторая непрозрачная подложка.
 */
const CONTENT_BASE =
    'max-w-none border-none bg-transparent p-0 shadow-none sm:max-w-none';

const CARD_BASE = 'flex flex-col p-6';

export interface GlassDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Ширина окна. */
    size?: GlassDialogSize;
    /**
     * Подложка под окном. `blur` — мягкое размытие (по умолчанию),
     * `dim` — заметнее затемняет и меньше размывает.
     */
    overlay?: GlassDialogOverlay;
    /** Доп. классы окна — например фиксированная высота `h-[85vh]`. */
    className?: string;
    /** Классы стеклянной карточки: `gap-*`, `max-h-*`, `overflow-hidden`. */
    cardClassName?: string;
    showCloseButton?: boolean;
    children: ReactNode;
}

/**
 * Модальное окно на «жидком стекле» — единая точка сборки для всей монорепы.
 *
 * Собирает связку, которую до этого копировали в каждом приложении: полностью
 * прозрачный DialogContent + размытая подложка + GlassCard intensity="liquid"
 * внутри. Шапку и содержимое задаёт вызывающая сторона — окна отличаются
 * (где-то DialogHeader, где-то заголовок с иконкой), и навязывать одну форму
 * шапки нельзя.
 *
 * Помните про цену: «жидкое стекло» — это один SVG-фильтр на экземпляр и
 * только Chromium (в Safari/Firefox GlassCard сам откатывается к soft-рецепту).
 * Держите на экране считаное число таких поверхностей.
 */
export const GlassDialog = ({
    open,
    onOpenChange,
    size = 'md',
    overlay = 'blur',
    className,
    cardClassName,
    showCloseButton,
    children,
}: GlassDialogProps) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
            className={cn(CONTENT_BASE, SIZE_CLASS[size], className)}
            overlayClassName={OVERLAY_CLASS[overlay]}
            showCloseButton={showCloseButton}
        >
            <GlassCard
                intensity="liquid"
                className={cn(CARD_BASE, cardClassName)}
            >
                {children}
            </GlassCard>
        </DialogContent>
    </Dialog>
);
