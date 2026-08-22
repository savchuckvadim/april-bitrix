'use client';

import { FC } from 'react';
import { cn } from '@workspace/ui/lib/utils';
import { LiquidChoiceBar, StepChoiceBar } from '@workspace/april-ui';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { setCurrentColor } from '../model/EventCompanyThunk';
import {
    PROSPECT_SCALE,
    type CompanyColorType,
} from '../utils/event-company-util';

/**
 * Прогноз по компании — кликабельная шкала из трёх ступеней.
 *
 * По умолчанию лёгкий вариант (StepChoiceBar): цвет ОДИН — текущего значения,
 * им закрашены ступени до него. Переливающаяся полоса всего спектра сразу
 * (LiquidChoiceBar, вариант `liquid`) заметна, но в плотной шапке перетягивала
 * внимание на себя — работа рядом выглядела тише прогноза.
 *
 * Цвета ступеней — токены темы, а не названия значений: `red/yellow/green` —
 * коды портального поля, не палитра.
 */
const SEGMENT_COLOR: Record<CompanyColorType, string> = {
    red: 'var(--destructive)',
    yellow: 'var(--warning)',
    green: 'var(--success)',
};

interface ProspectScaleProps {
    compact?: boolean;
    /** `flat` — ступени одним цветом; `liquid` — прежняя градиентная полоса. */
    variant?: 'flat' | 'liquid';
}

export const ProspectScale: FC<ProspectScaleProps> = ({
    compact,
    variant = 'flat',
}) => {
    const dispatch = useAppDispatch();
    const color = useAppSelector(s => s.company.color);

    if (!color.field) return null;

    const current = color.current?.code as CompanyColorType | undefined;

    const steps = PROSPECT_SCALE.map(step => ({
        code: step.code,
        label: step.name,
        color: SEGMENT_COLOR[step.code],
    }));
    const select = (code: string) =>
        dispatch(setCurrentColor(code as CompanyColorType));

    return (
        <div
            className={cn(
                'flex min-w-0 items-center',
                compact ? 'gap-1' : 'gap-2',
            )}
        >
            {variant === 'liquid' ? (
                <LiquidChoiceBar
                    className={compact ? 'w-24 shrink-0' : 'w-36 shrink-0'}
                    size="sm"
                    segments={steps}
                    value={current ?? null}
                    disabled={color.isLoading}
                    onSelect={select}
                    ariaLabel="Прогноз по компании"
                />
            ) : (
                <StepChoiceBar
                    className={compact ? 'w-20 shrink-0' : 'w-28 shrink-0'}
                    size={compact ? 'sm' : 'md'}
                    steps={steps}
                    value={current ?? null}
                    disabled={color.isLoading}
                    onSelect={select}
                    ariaLabel="Прогноз по компании"
                />
            )}

            {/* В компактной шапке подпись съедала бы ширину — значение
                видно по наведению (liquid-бэйдж и title зон). */}
            {!compact && (
                <span
                    className={cn(
                        'min-w-0 truncate text-xs',
                        color.error
                            ? 'text-destructive'
                            : 'text-muted-foreground',
                    )}
                >
                    {color.error || color.current?.name || 'Прогноз не задан'}
                </span>
            )}
        </div>
    );
};
