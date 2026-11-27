'use client';

import { FilterChips } from '@workspace/april-ui/fields';
import { Field } from '@workspace/ui/shared';

export interface InvoiceCriteriaOption<T extends string> {
    value: T;
    label: string;
}

export interface InvoiceCriteriaFieldProps<T extends string> {
    label: string;
    options: readonly InvoiceCriteriaOption<T>[];
    selected: readonly T[];
    onToggle: (code: T) => void;
}

/**
 * Список критериев подбора чипами. Ничего не выбрано, значит шаблон
 * подходит любому значению (на бэке это «без ограничения»).
 */
export function InvoiceCriteriaField<T extends string>({
    label,
    options,
    selected,
    onToggle,
}: InvoiceCriteriaFieldProps<T>) {
    return (
        <Field
            label={label}
            helperText={
                selected.length
                    ? 'Шаблон подходит только выбранным значениям.'
                    : 'Ничего не выбрано: шаблон подходит любому значению.'
            }
        >
            <FilterChips
                ariaLabel={label}
                items={options.map(option => ({
                    id: option.value,
                    label: option.label,
                    selected: selected.includes(option.value),
                }))}
                // id чипа и есть код из options
                onToggle={id => onToggle(id as T)}
            />
        </Field>
    );
}
