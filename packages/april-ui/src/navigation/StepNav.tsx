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
                                'h-px w-4 shrink-0 sm:w-6',
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
                                'flex cursor-pointer items-center gap-2 rounded-full py-1 pr-3 pl-1 text-sm transition-colors',
                                'hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                                'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent',
                                step.state === 'current'
                                    ? 'font-semibold text-foreground'
                                    : 'text-muted-foreground',
                            )}
                        >
                            <span
                                className={cn(
                                    'flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold [&>svg]:size-3.5',
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
