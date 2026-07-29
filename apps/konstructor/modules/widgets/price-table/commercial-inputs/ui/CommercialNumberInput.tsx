'use client';

import type { ReactNode } from 'react';
import { Input } from '@workspace/ui/components/input';
import type {
    CommercialEdit,
    CommercialField,
    RowPrice,
} from '@/modules/entities/row-set';
import { useCommercialInput } from '../hooks/use-commercial-input';

interface CommercialNumberInputProps {
    field: CommercialField;
    label: string;
    price: RowPrice;
    displayValue: number;
    disabled: boolean;
    onCommit: (edit: CommercialEdit) => void;
    adornment?: ReactNode;
    /** Подпись под полем: мера («абон. 12 мес.»), цена в месяц и т.п. */
    hint?: string;
}

export const CommercialNumberInput = ({
    field,
    label,
    price,
    displayValue,
    disabled,
    onCommit,
    adornment,
    hint,
}: CommercialNumberInputProps) => {
    const input = useCommercialInput({ field, price, displayValue, onCommit });

    return (
        <label className="flex min-w-24 flex-1 flex-col gap-0.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
                {label}
                {adornment}
            </span>
            <Input
                inputMode="decimal"
                className="h-8 text-right text-sm"
                value={input.value}
                disabled={disabled}
                onFocus={input.onFocus}
                onChange={event => input.onChange(event.target.value)}
                onBlur={input.onBlur}
                onKeyDown={event => input.onKeyDown(event.key)}
            />
            {hint ? (
                <span className="truncate text-[10px] leading-tight" title={hint}>
                    {hint}
                </span>
            ) : null}
        </label>
    );
};
