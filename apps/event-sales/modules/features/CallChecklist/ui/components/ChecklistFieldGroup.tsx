'use client';

import { FC } from 'react';
import type { ChecklistFieldGroupView } from '../../lib/checklist-field-groups';
import { ChecklistField } from './ChecklistField';

/**
 * Секция вопросов анкеты: тонкая полоса с названием группы и её вопросы.
 *
 * Название написано один раз на полосе, а не в каждом лейбле («КЛИЕНТ: …»
 * подряд читается шумом). Группы у вопросов нет — полосы тоже нет, блок
 * выглядит ровно как раньше.
 */
export const ChecklistFieldGroup: FC<{ group: ChecklistFieldGroupView }> = ({
    group,
}) => (
    <div className="space-y-1.5">
        {group.title && (
            <div className="flex items-center gap-2 pt-0.5" aria-hidden>
                <span className="text-[0.625rem] font-medium tracking-wide text-muted-foreground uppercase">
                    {group.title}
                </span>
                <span className="h-px flex-1 bg-border" />
            </div>
        )}
        {group.fields.map(field => (
            <ChecklistField key={field.answerKey} field={field} />
        ))}
    </div>
);
