'use client';

import { FC } from 'react';
import { cn } from '@workspace/ui/lib/utils';
import { LiquidChoiceBar, StepChoiceBar } from '@workspace/april-ui';
import { useProspectScale } from '../lib/hooks/use-prospect-scale';

/**
 * Прогноз по компании — кликабельная шкала из трёх ступеней.
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
interface ProspectScaleProps {
    compact?: boolean;
    /** `flat` — ступени одним цветом; `liquid` — прежняя градиентная полоса. */
    variant?: 'flat' | 'liquid';
    /** Полная ширина + подпись отдельной строкой (карточки и окна). */
    block?: boolean;
}

export const ProspectScale: FC<ProspectScaleProps> = ({
    compact,
    variant = 'flat',
    block,
}) => {
    const scale = useProspectScale();

    if (!scale.hasField) return null;

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
                    onSelect={scale.select}
                    ariaLabel="Прогноз по компании"
                />
            ) : (
                <StepChoiceBar
                    className={barClassName}
                    size={compact ? 'sm' : 'md'}
                    steps={scale.steps}
                    value={scale.current}
                    disabled={scale.isLoading}
                    onSelect={scale.select}
                    onPreview={scale.setPreview}
                    ariaLabel="Прогноз по компании"
                />
            )}

            {/* В компактной шапке подпись съедала бы ширину — значение
                видно по наведению (liquid-бэйдж и title зон). */}
            {!compact && (
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
        </div>
    );
};
