'use client';

import { FC, useState } from 'react';
import { cn } from '@workspace/ui/lib/utils';
import { isKeyboardFocus } from '../../../lib/focus';

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
    /** Ступень под курсором/клавиатурным фокусом; null — превью снято. */
    onPreview?: (code: string | null) => void;
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

/** Полупрозрачная заливка «так будет после клика». */
const previewFill = (color: string) =>
    `color-mix(in oklab, ${color} 35%, transparent)`;

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
 * ТЕКУЩЕЕ ЗНАЧЕНИЕ ВИДНО ВСЕГДА. Раньше наведение/фокус ПОДМЕНЯЛИ заливку
 * превью, и шкала переставала показывать, что стоит сейчас; в модальном окне
 * это случалось само собой — Radix при открытии переводит фокус на первую
 * ступень, и окно показывало первую ступень вместо реального значения.
 * Теперь превью — это рамка (и полупрозрачная доливка новых ступеней) ПОВЕРХ
 * текущей заливки: одновременно видно «что стоит» и «что станет». Ступени,
 * которые при клике погаснут, приглушаются.
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
    onPreview,
    disabled,
    size = 'sm',
    ariaLabel,
    className,
}) => {
    const [previewIndex, setPreviewIndex] = useState<number | null>(null);

    const showPreview = (index: number) => {
        setPreviewIndex(index);
        onPreview?.(steps[index]?.code ?? null);
    };
    const hidePreview = () => {
        setPreviewIndex(null);
        onPreview?.(null);
    };

    if (!steps.length) return null;

    const currentIndex = steps.findIndex(step => step.code === value);
    const hasValue = currentIndex >= 0;
    const currentColor = hasValue ? steps[currentIndex]?.color : null;
    // Превью показываем только когда оно РАСХОДИТСЯ с текущим значением:
    // наведение на уже выбранную ступень ничего не меняет.
    const hasPreview = previewIndex !== null && previewIndex !== currentIndex;
    const previewColor =
        previewIndex !== null ? steps[previewIndex]?.color : null;
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
            onPointerLeave={hidePreview}
        >
            {steps.map((step, index) => {
                const isFilled = hasValue && index <= currentIndex;
                const isCurrent = index === currentIndex;
                const inPreview =
                    hasPreview &&
                    previewIndex !== null &&
                    index <= previewIndex;
                /** Ступень доливается выбором. */
                const willAdd = inPreview && !isFilled;
                /** Ступень погаснет: выбор ниже текущего. */
                const willDrop = hasPreview && isFilled && !inPreview;

                return (
                    <button
                        key={step.code}
                        type="button"
                        role="radio"
                        aria-checked={isCurrent}
                        aria-label={step.label}
                        title={step.label}
                        disabled={disabled}
                        onPointerEnter={() => showPreview(index)}
                        onFocus={event => {
                            if (isKeyboardFocus(event.currentTarget)) {
                                showPreview(index);
                            }
                        }}
                        onBlur={hidePreview}
                        onClick={() => onSelect?.(step.code)}
                        className={cn(
                            'min-w-0 flex-1 cursor-pointer rounded-full transition-all duration-200 ease-out',
                            // Текущая ступень выше остальных — выбор виден
                            // и без цвета (важно для дальтоников и печати).
                            isCurrent ? height.active : height.base,
                            !isFilled && !willAdd && 'bg-foreground/10',
                            willDrop && 'opacity-35',
                            !hasValue &&
                                !hasPreview &&
                                'border border-dashed border-foreground/25 bg-transparent',
                        )}
                        style={{
                            backgroundColor: isFilled
                                ? (currentColor ?? undefined)
                                : willAdd && previewColor
                                  ? previewFill(previewColor)
                                  : undefined,
                            boxShadow:
                                inPreview && previewColor
                                    ? `inset 0 0 0 2px ${previewColor}`
                                    : undefined,
                        }}
                    />
                );
            })}
        </div>
    );
};
