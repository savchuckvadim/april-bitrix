'use client';

import { FC } from 'react';
import { cn } from '@workspace/ui/lib/utils';
import { useInlineChecklists } from '../lib/hooks/use-inline-checklists';
import { ChecklistField } from './components/ChecklistField';

/**
 * Инлайн-чек-лист в колонке плана: выбрал тип звонка «Доработка»/«Оплата» —
 * под типом появились поля, которые заказчик требует заполнить ДО
 * планирования такого звонка (с показом текущих значений из CRM).
 *
 * Сам решает, показываться ли: нет активных чек-листов (настройка портала
 * выключена, тип не тот, поля не установлены) — не рендерится ничего.
 * Обязательность дублируется в send-validation: незаполненный чек-лист
 * блокирует отправку пунктом окна предпроверки.
 */
export const ChecklistInlineCard: FC = () => {
    const { checklists, error } = useInlineChecklists();
    if (!checklists.length) return null;

    return (
        <div className="space-y-2">
            {checklists.map(({ def, fields }) => {
                const hasMissing = fields.some(field => field.isMissing);
                return (
                    <div
                        key={def.id}
                        className={cn(
                            'space-y-1.5 rounded-lg border border-l-[3px] bg-card/60 p-2',
                            hasMissing
                                ? 'border-l-destructive'
                                : 'border-l-[var(--event-current)]',
                        )}
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold">
                                {def.title}
                            </span>
                            {hasMissing && (
                                <span className="text-[0.65rem] font-semibold text-destructive">
                                    • обязательно заполнить
                                </span>
                            )}
                        </div>
                        {def.hint && (
                            <p className="text-[0.6875rem] leading-relaxed text-muted-foreground">
                                {def.hint}
                            </p>
                        )}
                        {fields.map(field => (
                            <ChecklistField
                                key={field.def.code}
                                field={field}
                            />
                        ))}
                        {error && (
                            <p className="text-[0.6875rem] text-destructive">
                                {error}
                            </p>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
