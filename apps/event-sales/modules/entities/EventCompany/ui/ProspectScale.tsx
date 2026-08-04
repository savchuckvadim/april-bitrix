'use client';

import { FC } from 'react';
import { cn } from '@workspace/ui/lib/utils';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { setCurrentColor } from '../model/EventCompanyThunk';
import {
    PROSPECT_SCALE,
    type CompanyColorType,
} from '../utils/event-company-util';

/**
 * Прогноз по компании — шкала из трёх делений.
 *
 * Раньше это была кнопка во всю ширину, циклившая red→yellow→green: значений
 * не видно, а чтобы вернуться на шаг назад, нужно было пройти круг. Теперь
 * деления кликабельны напрямую — один тап до любого значения, и видно, что
 * шкала ровно из трёх ступеней. Непрерывный градиент здесь был бы красивее, но
 * обещал бы плавность, которой у поля нет.
 *
 * Цвета берём из тонов монорепы, а не из названий значений: `red/yellow/green`
 * — это коды портального поля, а не палитра.
 */
export const ProspectScale: FC = () => {
    const dispatch = useAppDispatch();
    const color = useAppSelector(s => s.company.color);

    if (!color.field) return null;

    const current = color.current?.code as CompanyColorType | undefined;

    return (
        <div className="flex min-w-0 items-center gap-2">
            <span
                className="flex shrink-0 items-center gap-0.5"
                role="radiogroup"
                aria-label="Прогноз по компании"
            >
                {PROSPECT_SCALE.map(step => {
                    const isCurrent = step.code === current;
                    return (
                        <button
                            key={step.code}
                            type="button"
                            role="radio"
                            aria-checked={isCurrent}
                            aria-label={step.name}
                            title={step.name}
                            disabled={color.isLoading}
                            onClick={() => dispatch(setCurrentColor(step.code))}
                            className={cn(
                                'h-2.5 w-7 rounded-[2px] transition-[height,opacity]',
                                'disabled:opacity-50',
                                isCurrent
                                    ? step.activeClass
                                    : 'bg-muted hover:bg-muted-foreground/30',
                                isCurrent && 'h-3.5',
                            )}
                        />
                    );
                })}
            </span>

            <span
                className={cn(
                    'min-w-0 truncate text-xs',
                    color.error ? 'text-destructive' : 'text-muted-foreground',
                )}
            >
                {color.error || color.current?.name || 'Прогноз не задан'}
            </span>
        </div>
    );
};
