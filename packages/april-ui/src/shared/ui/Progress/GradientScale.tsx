'use client';

import React, { useState, type MouseEvent, type ReactNode } from 'react';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@workspace/ui/components/tooltip';
import { cn } from '@workspace/ui/lib/utils';
import { StageProgress } from './StageProgress';

export interface GradientScaleProps {
    /**
     * Подписи делений слева направо (стадии воронки, значения характеристики).
     * Пустой массив — шкала без делений: тогда обязателен `value`.
     */
    labels?: string[];
    /** Текущее деление, 0-based; -1 — не определено. */
    currentIndex?: number;
    /** Доля заполнения, когда делений нет (0…1). */
    value?: number;
    /** Всего делений (насечки); по умолчанию — длина labels. */
    total?: number;
    /** Цвета градиента (см. StageProgress). */
    ramp?: string[];
    rampScope?: 'track' | 'fill';
    shimmer?: boolean;
    /** Клик по делению — шкала становится выбором значения. */
    onSelect?: (index: number) => void;
    /** Заголовок тултипа (название сущности/характеристики). */
    title?: string;
    /** Дополнительная строка тултипа. */
    note?: ReactNode;
    /** Как назвать текущее деление в тултипе. */
    currentWord?: string;
    /** Слот справа от полосы: метка, счётчик. */
    trailing?: ReactNode;
    ariaLabel?: string;
    className?: string;
}

/** Позиция курсора: индекс деления + X в пикселях от левого края. */
interface HoverState {
    index: number;
    x: number;
}

const clampIndex = (ratio: number, total: number): number =>
    Math.max(0, Math.min(total - 1, Math.floor(ratio * total)));

/**
 * Градиентная шкала с тултипом, идущим ЗА КУРСОРОМ: наведение называет
 * деление под курсором, а не только текущее. Одна компонента на все шкалы
 * приложения — стадии сделок/лидов и pbx-характеристики контактов.
 *
 * С `onSelect` шкала становится кликабельным выбором значения (как в старом
 * «конструкторе»): клик по делению выбирает именно его.
 */
export const GradientScale: React.FC<GradientScaleProps> = ({
    labels = [],
    currentIndex = -1,
    value,
    total,
    ramp,
    rampScope,
    shimmer,
    onSelect,
    title,
    note,
    currentWord = 'текущая',
    trailing,
    ariaLabel,
    className,
}) => {
    const [hover, setHover] = useState<HoverState | null>(null);

    const steps = total ?? labels.length;
    const fill =
        value ??
        (steps > 0 && currentIndex >= 0 ? (currentIndex + 1) / steps : 0);
    if (!fill && !steps) return null;

    const indexAt = (event: MouseEvent<HTMLElement>): HoverState | null => {
        const rect = event.currentTarget.getBoundingClientRect();
        if (!rect.width || steps <= 0) return null;
        const x = event.clientX - rect.left;
        return { index: clampIndex(x / rect.width, steps), x };
    };

    const hoveredIndex = hover?.index ?? currentIndex;
    const hoveredLabel = labels[hoveredIndex];
    const currentLabel = labels[currentIndex];
    const isCurrentHovered = hoveredIndex === currentIndex;
    const position =
        currentIndex >= 0 && steps > 0 ? `${currentIndex + 1} / ${steps}` : '';

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <div
                    tabIndex={0}
                    role={onSelect ? 'button' : undefined}
                    aria-label={
                        ariaLabel ??
                        `${title ? `${title}: ` : ''}${currentLabel ?? position}`
                    }
                    className={cn(
                        'flex items-center gap-1.5 rounded-sm py-1 outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        onSelect ? 'cursor-pointer' : 'cursor-default',
                        className,
                    )}
                    onMouseMove={event => {
                        const next = indexAt(event);
                        if (!next) return;
                        // Перерисовываем только на смене деления или заметном
                        // сдвиге: mousemove сыпется десятками в секунду.
                        setHover(prev =>
                            prev &&
                            prev.index === next.index &&
                            Math.abs(prev.x - next.x) < 8
                                ? prev
                                : next,
                        );
                    }}
                    onMouseLeave={() => setHover(null)}
                    onClick={event => {
                        if (!onSelect) return;
                        const next = indexAt(event);
                        if (next) onSelect(next.index);
                    }}
                >
                    <StageProgress
                        value={fill}
                        total={steps || undefined}
                        ramp={ramp}
                        rampScope={rampScope}
                        shimmer={shimmer}
                        className="min-w-0 flex-1"
                    />
                    {trailing}
                </div>
            </TooltipTrigger>
            {/* alignOffset = X курсора: подсказка открывается там, где смотрят. */}
            <TooltipContent
                side="top"
                align="start"
                alignOffset={hover?.x ?? 0}
                collisionPadding={8}
            >
                {title && <p className="text-primary-foreground/70">{title}</p>}
                {hoveredLabel && (
                    <p className="font-medium">
                        {hoveredLabel}
                        {isCurrentHovered ? ` — ${currentWord}` : ''}
                    </p>
                )}
                {!isCurrentHovered && currentLabel && (
                    <p className="text-primary-foreground/70">
                        {`Сейчас: ${currentLabel}`}
                        {position ? ` · ${position}` : ''}
                    </p>
                )}
                {!labels.length && position && <p>{position}</p>}
                {note}
            </TooltipContent>
        </Tooltip>
    );
};
