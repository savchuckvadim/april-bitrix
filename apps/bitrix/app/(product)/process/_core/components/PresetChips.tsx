'use client';

import type { FC } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import type { ProcessPreset } from '../types';

export interface PresetChipsProps {
    presets: ProcessPreset[];
    activeId: string | null;
    onApply: (preset: ProcessPreset) => void;
    className?: string;
}

/**
 * Готовые комбинации крутилок. Пять из них — позиции графика из документации,
 * шестая («Полное дублирование») — предельный случай, когда покрытия совпадают.
 *
 * Рекомендованная схема вынесена отдельной крупной кнопкой над остальными:
 * первый вопрос заказчика — «а как правильно?», и ответ на него не должен
 * теряться в ряду одинаковых пилюль.
 */
export const PresetChips: FC<PresetChipsProps> = ({
    presets,
    activeId,
    onApply,
    className,
}) => {
    const recommended = presets.find(preset => preset.recommended);
    const rest = presets.filter(preset => !preset.recommended);

    return (
        <div className={cn('flex flex-col gap-2', className)}>
            {recommended && (
                <button
                    type="button"
                    onClick={() => onApply(recommended)}
                    aria-pressed={recommended.id === activeId}
                    title={recommended.whyRecommended ?? recommended.meaning}
                    className={cn(
                        'focus-visible:outline-primary group flex w-full cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all focus-visible:outline-2',
                        recommended.id === activeId
                            ? 'border-success bg-success/15 shadow-sm'
                            : 'border-success/50 bg-success/5 hover:border-success hover:bg-success/10 hover:shadow-sm',
                    )}
                >
                    <Star
                        className="text-success size-4 shrink-0 fill-current"
                        aria-hidden
                    />

                    <span className="min-w-0 flex-1">
                        <span className="text-success block text-sm font-bold">
                            {recommended.label}
                        </span>
                        <span className="text-muted-foreground block text-[11px] leading-snug">
                            рекомендуем — лид {recommended.leadPct} %, сделка{' '}
                            {recommended.dealPct} %
                        </span>
                    </span>

                    {recommended.id === activeId && (
                        <span className="text-success shrink-0 text-xs font-semibold">
                            выбрано
                        </span>
                    )}
                </button>
            )}

            <div
                role="radiogroup"
                aria-label="Другие схемы работы"
                className="flex flex-wrap gap-1.5"
            >
                {rest.map(preset => {
                    const isActive = preset.id === activeId;

                    return (
                        <button
                            key={preset.id}
                            type="button"
                            role="radio"
                            aria-checked={isActive}
                            title={preset.meaning}
                            onClick={() => onApply(preset)}
                            className={cn(
                                'focus-visible:outline-primary cursor-pointer rounded-full border px-3 py-1.5 text-xs transition-colors focus-visible:outline-2',
                                isActive
                                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                                    : 'text-muted-foreground hover:border-primary hover:bg-primary/5 hover:text-primary',
                            )}
                        >
                            {preset.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
