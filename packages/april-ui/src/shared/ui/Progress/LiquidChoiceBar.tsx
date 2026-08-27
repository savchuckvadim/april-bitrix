'use client';

import { FC, useState } from 'react';
import { cn } from '@workspace/ui/lib/utils';
import { ToneBadge } from '../../../badges/ToneBadge';
import { isKeyboardFocus } from '../../../lib/focus';

export interface LiquidChoiceSegment {
    code: string;
    /** Подпись значения — уходит в liquid-бэйдж и в aria. */
    label: string;
    /** CSS-цвет сегмента: токен через var(--…), не hex. */
    color: string;
}

export interface LiquidChoiceBarProps {
    segments: LiquidChoiceSegment[];
    /** Код текущего значения. */
    value?: string | null;
    onSelect?: (code: string) => void;
    disabled?: boolean;
    /**
     * `md` — толстая полоса с набуханием зоны и liquid-бэйджем (карточки,
     * окна); `sm` — ниже ростом и без бэйджа (компактные шапки).
     */
    size?: 'sm' | 'md';
    ariaLabel?: string;
    className?: string;
}

/**
 * Толстая переливающаяся полоса-выбор: кликабельные зоны по числу значений.
 *
 * Идея из легаси-компонента цвета компании (CompanyColor: одна полоса, клик
 * циклит значения) — но цикл заставлял идти по кругу ради шага назад. Здесь
 * вся полоса — непрерывный градиент значений: каждая зона несёт свой ломоть
 * общего градиента (background-size N×100%), при наведении зона набухает, а
 * поверх плавает жидкая бэйдж-кнопка (ToneBadge surface="liquid" — SVG-
 * рефракция, одна на полосу) с подписью значения под курсором или текущего.
 *
 * Компонент не знает про домены: сегменты и запись значения — забота
 * вызывающего (цвет компании сегодня, любые индикаторы завтра).
 */
export const LiquidChoiceBar: FC<LiquidChoiceBarProps> = ({
    segments,
    value,
    onSelect,
    disabled,
    size = 'md',
    ariaLabel,
    className,
}) => {
    const [hovered, setHovered] = useState<number | null>(null);

    if (!segments.length) return null;

    const currentIndex = segments.findIndex(segment => segment.code === value);
    const badgeIndex = hovered ?? (currentIndex >= 0 ? currentIndex : null);
    const badgeSegment = badgeIndex !== null ? segments[badgeIndex] : null;

    const gradient = `linear-gradient(90deg, ${segments
        .map(segment => segment.color)
        .join(', ')})`;
    const isThick = size === 'md';

    return (
        <div className={cn('relative min-w-0', isThick && 'pt-6', className)}>
            {/* Жидкая бэйдж-кнопка переезжает к зоне под курсором. Одна на
                полосу — в пределах предупреждения ToneBadge о цене SVG-фильтра. */}
            {isThick && badgeSegment && badgeIndex !== null && (
                <span
                    aria-hidden
                    className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 transition-[left] duration-300 ease-out"
                    style={{
                        left: `${((badgeIndex + 0.5) / segments.length) * 100}%`,
                    }}
                >
                    <ToneBadge tone="muted" surface="liquid" size="sm">
                        {badgeSegment.label}
                    </ToneBadge>
                </span>
            )}

            <div
                role="radiogroup"
                aria-label={ariaLabel}
                className={cn(
                    'relative flex w-full overflow-visible',
                    disabled && 'pointer-events-none opacity-50',
                )}
                onMouseLeave={() => setHovered(null)}
            >
                {segments.map((segment, index) => {
                    const isCurrent = index === currentIndex;
                    const isHovered = index === hovered;
                    return (
                        <button
                            key={segment.code}
                            type="button"
                            role="radio"
                            aria-checked={isCurrent}
                            aria-label={segment.label}
                            title={segment.label}
                            disabled={disabled}
                            onMouseEnter={() => setHovered(index)}
                            // Только КЛАВИАТУРНЫЙ фокус: модальное окно при
                            // открытии само уводит фокус на первую зону, и
                            // бэйдж уезжал к ней вместо текущего значения.
                            onFocus={event => {
                                if (isKeyboardFocus(event.currentTarget)) {
                                    setHovered(index);
                                }
                            }}
                            onBlur={() => setHovered(null)}
                            onClick={() => onSelect?.(segment.code)}
                            className={cn(
                                'relative min-w-0 flex-1 cursor-pointer transition-transform duration-200 ease-out',
                                isThick ? 'h-3.5' : 'h-2.5',
                                index === 0 && 'rounded-l-full',
                                index === segments.length - 1 &&
                                    'rounded-r-full',
                                // Набухание: зона под курсором растёт, текущая
                                // слегка приподнята всегда — видно выбор.
                                isHovered && isThick && 'scale-y-[1.35]',
                                !isHovered && isCurrent && 'scale-y-[1.15]',
                                !isHovered &&
                                    !isCurrent &&
                                    currentIndex >= 0 &&
                                    'opacity-80',
                            )}
                            style={{
                                // Ломоть ОБЩЕГО градиента: соседние зоны
                                // продолжают друг друга без швов.
                                backgroundImage: gradient,
                                backgroundSize: `${segments.length * 100}% 100%`,
                                backgroundPosition:
                                    segments.length > 1
                                        ? `${(index / (segments.length - 1)) * 100}% 0`
                                        : '0 0',
                            }}
                        />
                    );
                })}

                {/* Перелив по всей полосе — как у шкал стадий. */}
                <span
                    aria-hidden
                    className={cn(
                        'animate-stage-sheen pointer-events-none absolute inset-0 motion-reduce:hidden',
                        'rounded-full bg-[linear-gradient(100deg,transparent_32%,color-mix(in_oklab,white_45%,transparent)_50%,transparent_68%)] bg-[length:240%_100%]',
                    )}
                />
            </div>
        </div>
    );
};
