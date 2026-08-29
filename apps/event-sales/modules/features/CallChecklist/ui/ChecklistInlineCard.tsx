'use client';

import { FC } from 'react';
import { cn } from '@workspace/ui/lib/utils';
import { useInlineChecklists } from '../lib/hooks/use-inline-checklists';
import { ChecklistFieldGroup } from './components/ChecklistFieldGroup';

interface ChecklistInlineCardProps {
    /**
     * Колонка: `plan` (по умолчанию) — что нужно знать ДО следующего
     * звонка; `report` — что выяснили В разговоре, по типу отчётного
     * события.
     */
    place?: 'plan' | 'report';
}

/**
 * Инлайн-блок вопросов в колонке.
 *
 * В плане: выбрал тип звонка «Доработка»/«Оплата» — под типом появились
 * поля, которые заказчик требует заполнить ДО планирования такого звонка.
 * В отчёте: отчитываешься по «Доработке»/«Решению»/«Оплате» — спрашиваем
 * итог разговора (возражение, исход решения, обещанную дату оплаты).
 * Везде с показом текущих значений из CRM.
 *
 * Сам решает, показываться ли: нет активных наборов (настройка портала
 * выключена, тип не тот, поля не установлены) — не рендерится ничего.
 * Обязательность дублируется в send-validation: незаполненное поле
 * блокирует отправку пунктом окна предпроверки.
 */
export const ChecklistInlineCard: FC<ChecklistInlineCardProps> = ({
    place = 'plan',
}) => {
    const { checklists, error } = useInlineChecklists(place);
    if (!checklists.length) return null;

    return (
        <div className="space-y-2">
            {checklists.map(({ def, fields, groups }) => {
                const hasMissing = fields.some(field => field.isMissing);
                return (
                    <div
                        key={def.code}
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
                        {groups.map((group, index) => (
                            <ChecklistFieldGroup
                                // Секции — позиционные: заголовок ставится
                                // там, где сменился groupTitle, и один и тот
                                // же заголовок может встретиться дважды.
                                key={`${group.title ?? ''}:${index}`}
                                group={group}
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
