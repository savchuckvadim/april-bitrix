'use client';

import { Fragment } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import { TONE_SOLID, TONE_TEXT, type Tone } from '../lib/tones';

export type StepNavState = 'done' | 'current' | 'upcoming';

export interface StepNavItem {
    code: string;
    label: string;
    state: StepNavState;
    /** Шаг недоступен для перехода (например, нечего ещё настраивать). */
    disabled?: boolean;
}

export interface StepNavProps {
    steps: StepNavItem[];
    onSelect?: (code: string) => void;
    /** Цвет текущего и пройденных шагов. */
    tone?: Tone;
    ariaLabel?: string;
    /** Шаги на всю ширину контейнера: первый у левого края, последний у правого. */
    stretch?: boolean;
    /** compact — тесная встройка (вкладка карточки CRM): мельче кружки и шрифт. */
    size?: 'default' | 'compact';
    className?: string;
}

/**
 * Навигация по шагам мастера: номер, подпись, пройденные — с галкой.
 *
 * В отличие от {@link StepChoiceBar} это не выбор значения, а переход между
 * экранами: каждый шаг — кнопка, текущий помечен `aria-current="step"`.
 * Маршрутов компонент не знает — переход делает вызывающий в `onSelect`.
 * На узком экране подпись остаётся только у текущего шага.
 */
export const StepNav = ({
    steps,
    onSelect,
    tone = 'primary',
    ariaLabel = 'Шаги',
    stretch = false,
    size = 'default',
    className,
}: StepNavProps) => (
    <nav aria-label={ariaLabel} className={cn('min-w-0', className)}>
        <ol className="flex items-center gap-1">
            {steps.map((step, index) => (
                <Fragment key={step.code}>
                    {index > 0 ? (
                        <li
                            aria-hidden
                            className={cn(
                                'h-px',
                                stretch
                                    ? 'min-w-4 flex-1'
                                    : 'w-4 shrink-0 sm:w-6',
                                step.state === 'upcoming'
                                    ? 'bg-border'
                                    : 'bg-foreground/30',
                            )}
                        />
                    ) : null}
                    <li className="min-w-0">
                        <button
                            type="button"
                            disabled={step.disabled}
                            aria-current={
                                step.state === 'current' ? 'step' : undefined
                            }
                            onClick={() => onSelect?.(step.code)}
                            className={cn(
                                'flex cursor-pointer items-center rounded-full transition-colors',
                                size === 'compact'
                                    ? 'gap-1.5 py-0.5 pr-2 pl-0.5 text-xs'
                                    : 'gap-2 py-1 pr-3 pl-1 text-sm',
                                'hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                                'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent',
                                step.state === 'current'
                                    ? 'font-semibold text-foreground'
                                    : 'text-muted-foreground',
                            )}
                        >
                            <span
                                className={cn(
                                    'flex shrink-0 items-center justify-center rounded-full font-semibold',
                                    size === 'compact'
                                        ? 'size-5 text-[0.625rem] [&>svg]:size-3'
                                        : 'size-6 text-xs [&>svg]:size-3.5',
                                    step.state === 'current' &&
                                        TONE_SOLID[tone],
                                    step.state === 'done' &&
                                        cn('bg-muted', TONE_TEXT[tone]),
                                    step.state === 'upcoming' &&
                                        'border border-border',
                                )}
                            >
                                {step.state === 'done' ? (
                                    <Check aria-hidden />
                                ) : (
                                    index + 1
                                )}
                            </span>
                            <span
                                className={cn(
                                    'truncate',
                                    step.state !== 'current' &&
                                        'hidden md:inline',
                                )}
                            >
                                {step.label}
                            </span>
                        </button>
                    </li>
                </Fragment>
            ))}
        </ol>
    </nav>
);
