'use client';

import { FC } from 'react';
import { MicroField, MicroSelect } from '@workspace/april-ui';
import { Input } from '@workspace/ui/components/input';
import { checklistEnumItems } from '../../lib/checklist-values';
import type { InlineChecklistFieldView } from '../../lib/hooks/use-inline-checklists';

/**
 * Одно поле чек-листа: контрол по типу + подпись текущего значения.
 *
 * «Сейчас: …» стоит отдельно от контрола: менеджер обязан УВИДЕТЬ, что уже
 * записано в CRM (требование заказчика — показывать текущие значения),
 * а не просто получить предзаполненный инпут.
 */
export const ChecklistField: FC<{ field: InlineChecklistFieldView }> = ({
    field,
}) => {
    const control =
        field.def.type === 'enumeration' && field.field ? (
            <MicroSelect
                ariaLabel={field.def.title}
                value={field.value || undefined}
                placeholder="Выбрать"
                options={checklistEnumItems(field.field).map(item => ({
                    value: item.code,
                    label: item.name,
                }))}
                onChange={field.setValue}
            />
        ) : field.def.type === 'money' ? (
            <Input
                type="number"
                min={0}
                step="any"
                inputMode="decimal"
                value={field.value}
                placeholder="0"
                aria-label={field.def.title}
                aria-invalid={field.isMissing}
                onChange={e => field.setValue(e.target.value)}
                className="h-6 w-34 px-2 py-0 text-[0.6875rem]"
            />
        ) : (
            <Input
                type="date"
                value={field.value}
                aria-label={field.def.title}
                aria-invalid={field.isMissing}
                onChange={e => field.setValue(e.target.value)}
                className="h-6 w-34 px-2 py-0 text-[0.6875rem]"
            />
        );

    return (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <MicroField label={field.def.title} required={field.def.required}>
                {control}
            </MicroField>
            {field.isSaved ? (
                <span className="text-[0.6875rem] text-success">
                    сохранено
                </span>
            ) : field.currentLabel ? (
                // Значение из CRM бывает длинным (названия причин) — не даём
                // ему распирать строку, полное видно по наведению.
                <span
                    title={field.currentLabel}
                    className="min-w-0 max-w-full truncate text-[0.6875rem] text-muted-foreground"
                >
                    сейчас: {field.currentLabel}
                </span>
            ) : (
                field.def.required && (
                    <span className="text-[0.6875rem] font-medium text-destructive">
                        не заполнено
                    </span>
                )
            )}
        </div>
    );
};
