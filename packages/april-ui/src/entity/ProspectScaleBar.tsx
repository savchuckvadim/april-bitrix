'use client';

import { cn } from '@workspace/ui/lib/utils';
import { LiquidChoiceBar } from '../shared/ui/Progress/LiquidChoiceBar';
import { StepChoiceBar } from '../shared/ui/Progress/StepChoiceBar';
import type { ProspectScaleView } from './prospect-scale';

export interface ProspectScaleBarProps extends ProspectScaleView {
    select: (code: string) => void;
    /** Ступень под курсором/клавиатурным фокусом (для подписи). */
    setPreview?: (code: string | null) => void;
    compact?: boolean;
    /** `flat` — ступени одним цветом; `liquid` — прежняя градиентная полоса. */
    variant?: 'flat' | 'liquid';
    /** Полная ширина + подпись отдельной строкой (карточки и окна). */
    block?: boolean;
}

/**
 * Прогноз по компании — кликабельная шкала из трёх ступеней. Общая для
 * «Звонков» и конструктора: данные и запись — хук приложения
 * (buildProspectScaleView + select).
 *
 * По умолчанию лёгкий вариант (StepChoiceBar): цвет ОДИН — текущего значения,
 * им закрашены ступени до него. Переливающаяся полоса всего спектра сразу
 * (LiquidChoiceBar, вариант `liquid`) заметна, но в плотной шапке перетягивала
 * внимание на себя — работа рядом выглядела тише прогноза.
 *
 * `block` — вид для ОКНА (предпроверка отправки): шкала во всю ширину, под
 * ней подпись «Сейчас: X → Y». В шапке подписи места нет, там значение видно
 * по наведению.
 */
export const ProspectScaleBar = ({
    compact,
    variant = 'flat',
    block,
    select,
    setPreview,
    ...scale
}: ProspectScaleBarProps) => {
    const barClassName = block
        ? 'w-full'
        : compact
          ? 'w-20 shrink-0'
          : 'w-28 shrink-0';

    return (
        <div
            className={cn(
                'flex min-w-0',
                block
                    ? 'flex-col gap-1.5'
                    : cn('items-center', compact ? 'gap-1' : 'gap-2'),
            )}
        >
            {variant === 'liquid' ? (
                <LiquidChoiceBar
                    className={block ? 'w-full' : compact ? 'w-24' : 'w-36'}
                    size="sm"
                    segments={scale.steps}
                    value={scale.current}
                    disabled={scale.isLoading}
                    onSelect={select}
                    ariaLabel="Прогноз по компании"
                />
            ) : (
                <StepChoiceBar
                    className={barClassName}
                    size={compact ? 'sm' : 'md'}
                    steps={scale.steps}
                    value={scale.current}
                    disabled={scale.isLoading}
                    onSelect={select}
                    onPreview={setPreview}
                    ariaLabel="Прогноз по компании"
                />
            )}

            {/* В компактной шапке подпись съедала бы ширину — значение
                видно по наведению (liquid-бэйдж и title зон). */}
            {!compact && block && (
                <span
                    className={cn(
                        'min-w-0 truncate text-xs',
                        scale.isCaptionError
                            ? 'text-destructive'
                            : 'text-muted-foreground',
                    )}
                >
                    {scale.caption}
                </span>
            )}
            {/* Шапка: подпись постоянной ширины («Сейчас: X»), а «Станет: Y»
                всплывает плашкой ПОВЕРХ — соседи не сдвигаются. */}
            {!compact && !block && (
                <span className="relative grid min-w-0 text-xs">
                    {/* Невидимые варианты в той же ячейке задают ширину по
                        самому длинному: «Сейчас: Красный» и «Сейчас: Зелёный»
                        разной длины, смена цвета не должна сдвигать соседей. */}
                    {scale.captionVariants.map(caption => (
                        <span
                            key={caption}
                            aria-hidden
                            className="invisible col-start-1 row-start-1 whitespace-nowrap"
                        >
                            {caption}
                        </span>
                    ))}
                    <span
                        className={cn(
                            'col-start-1 row-start-1 truncate',
                            scale.isCaptionError
                                ? 'text-destructive'
                                : 'text-muted-foreground',
                        )}
                    >
                        {scale.currentCaption}
                    </span>
                    {scale.previewCaption && (
                        <span
                            role="status"
                            className="pointer-events-none absolute left-0 top-full z-30 mt-1 whitespace-nowrap rounded-md border border-border bg-popover px-2 py-0.5 text-xs text-popover-foreground shadow-sm"
                        >
                            {scale.previewCaption}
                        </span>
                    )}
                </span>
            )}
        </div>
    );
};
