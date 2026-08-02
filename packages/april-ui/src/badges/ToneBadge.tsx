'use client';

import type { ReactNode } from 'react';
import { cn } from '@workspace/ui/lib/utils';
import { TONE_BORDER, TONE_SOFT, TONE_SOLID, TONE_TEXT, type Tone } from '../lib/tones';
import { GlassSurface } from '../shared/ui/Glass/GlassSurface';
import { useGlass } from '../lib/glass/use-glass';

export type ToneBadgeVariant = 'solid' | 'soft' | 'outline';
export type ToneBadgeSurface = 'flat' | 'glass' | 'liquid';
export type ToneBadgeSize = 'sm' | 'md';

export interface ToneBadgeProps {
    /** Цвет из единого реестра тонов. */
    tone?: Tone;
    /** solid — заливка, soft — приглушённая подложка, outline — только рамка. */
    variant?: ToneBadgeVariant;
    /**
     * Поверхность бэйджа:
     * - `flat` — обычная (дефолт);
     * - `glass` — полупрозрачная с блюром, дёшево и работает везде;
     * - `liquid` — рефракция фона как у iOS.
     *
     * ⚠️ `liquid` рендерит по SVG-фильтру НА КАЖДЫЙ бэйдж. Для одиночного
     * акцентного бэйджа это нормально, для списка/таблицы — нет: там берите
     * `glass`. Оба варианта слушаются общего выключателя стекла: выключили —
     * бэйдж становится обычным, а GlassSurface не рендерится вовсе.
     */
    surface?: ToneBadgeSurface;
    size?: ToneBadgeSize;
    uppercase?: boolean;
    className?: string;
    children: ReactNode;
}

const SIZE_CLASS: Record<ToneBadgeSize, string> = {
    sm: 'px-1.5 py-0 text-[0.6875rem]',
    md: 'px-2 py-0.5 text-xs',
};

const BASE =
    'inline-flex w-fit shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-md font-medium [&>svg]:size-3 [&>svg]:pointer-events-none';

/**
 * Бэйдж дизайн-системы: цвет берётся из реестра тонов, поэтому статусы,
 * типы событий и комплекты красятся одинаково во всех приложениях.
 *
 * Заменяет ручную сборку `<Badge className="bg-… text-…">` и локальные
 * таблицы «значение → className».
 */
export const ToneBadge = ({
    tone = 'neutral',
    variant = 'solid',
    surface = 'flat',
    size = 'md',
    uppercase = false,
    className,
    children,
}: ToneBadgeProps) => {
    const { enabled } = useGlass();

    const variantClass =
        variant === 'solid'
            ? TONE_SOLID[tone]
            : variant === 'soft'
              ? TONE_SOFT[tone]
              : cn('border', TONE_BORDER[tone], TONE_TEXT[tone]);

    const isLiquid = surface === 'liquid' && enabled;

    const classes = cn(
        BASE,
        SIZE_CLASS[size],
        uppercase && 'uppercase',
        // Стеклянные варианты несут свои фон и рамку — заливку тона убираем,
        // от тона остаётся только цвет текста, иначе сквозь бэйдж ничего не видно.
        surface === 'flat' ? variantClass : cn(TONE_TEXT[tone], 'border-transparent'),
        surface === 'glass' && 'glass',
        className,
    );

    if (isLiquid) {
        return (
            <GlassSurface borderRadius={999} className={classes}>
                {children}
            </GlassSurface>
        );
    }

    return <span className={classes}>{children}</span>;
};
