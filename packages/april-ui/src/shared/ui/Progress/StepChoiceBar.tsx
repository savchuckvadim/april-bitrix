'use client';

import { FC, useState } from 'react';
import { cn } from '@workspace/ui/lib/utils';

export interface StepChoiceStep {
    code: string;
    /** Подпись значения — в подсказку зоны и в aria. */
    label: string;
    /** CSS-цвет ступени: токен через var(--…), не hex. */
    color: string;
}

export interface StepChoiceBarProps {
    steps: StepChoiceStep[];
    /** Код текущего значения; null — не выбрано. */
    value?: string | null;
    onSelect?: (code: string) => void;
    disabled?: boolean;
    /** `sm` — для плотных шапок, `md` — для карточек и окон. */
    size?: 'sm' | 'md';
    ariaLabel?: string;
    className?: string;
}

const HEIGHT: Record<'sm' | 'md', { base: string; active: string }> = {
    sm: { base: 'h-1.5', active: 'h-2.5' },
    md: { base: 'h-2', active: 'h-3.5' },
};

/**
 * Ступенчатый выбор-прогресс: отдельные плоские ступени вместо сплошной
 * заливки.
 *
 * Лёгкая альтернатива {@link LiquidChoiceBar}. Тот несёт весь спектр значений
 * сразу — непрерывный градиент от красного к зелёному плюс стеклянный бэйдж:
 * заметно, но тяжело, и в плотной шапке такая полоса перетягивает внимание с
 * работы. Здесь цвет ОДИН — цвет текущего значения, и им закрашены ступени
 * до него включительно. Дальше — нейтральный трек.
 *
 * Читается как шкала («докуда дошли»), а состояние узнаётся цветом и длиной
 * закраски, без палитры во всю ширину. Значение не выбрано — пунктирная
 * рамка: пусто, но видно, что здесь ждут ответа.
 *
 * Домены компонент не знает: ступени и запись значения — забота вызывающего.
 */
export const StepChoiceBar: FC<StepChoiceBarProps> = ({
    steps,
    value,
    onSelect,
    disabled,
    size = 'sm',
    ariaLabel,
    className,
}) => {
    const [hovered, setHovered] = useState<number | null>(null);

    if (!steps.length) return null;

    const currentIndex = steps.findIndex(step => step.code === value);
    const hasValue = currentIndex >= 0;
    // Под курсором показываем, ЧТО получится при клике: закраска едет за
    // мышью, поэтому выбор виден до нажатия.
    const previewIndex = hovered ?? currentIndex;
    const previewColor = previewIndex >= 0 ? steps[previewIndex]?.color : null;
    const height = HEIGHT[size];

    return (
        <div
            role="radiogroup"
            aria-label={ariaLabel}
            className={cn(
                'flex min-w-0 items-center gap-1',
                disabled && 'pointer-events-none opacity-50',
                className,
            )}
            onMouseLeave={() => setHovered(null)}
        >
            {steps.map((step, index) => {
                const isFilled = previewIndex >= 0 && index <= previewIndex;
                const isCurrent = index === currentIndex;

                return (
                    <button
                        key={step.code}
                        type="button"
                        role="radio"
                        aria-checked={isCurrent}
                        aria-label={step.label}
                        title={step.label}
                        disabled={disabled}
                        onMouseEnter={() => setHovered(index)}
                        onFocus={() => setHovered(index)}
                        onBlur={() => setHovered(null)}
                        onClick={() => onSelect?.(step.code)}
                        className={cn(
                            'min-w-0 flex-1 cursor-pointer rounded-full transition-all duration-200 ease-out',
                            // Текущая ступень выше остальных — выбор виден
                            // и без цвета (важно для дальтоников и печати).
                            isCurrent ? height.active : height.base,
                            !isFilled && 'bg-foreground/10',
                            !hasValue &&
                                hovered === null &&
                                'border border-dashed border-foreground/25 bg-transparent',
                        )}
                        style={
                            isFilled && previewColor
                                ? { backgroundColor: previewColor }
                                : undefined
                        }
                    />
                );
            })}
        </div>
    );
};
