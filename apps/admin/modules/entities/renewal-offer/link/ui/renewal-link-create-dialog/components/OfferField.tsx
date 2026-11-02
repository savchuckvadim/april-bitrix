'use client';

import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';

interface OfferFieldProps {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    /** Подпись справа внутри поля: ₽, чел., ч. */
    suffix?: string;
    hint?: string;
    placeholder?: string;
    disabled?: boolean;
    type?: 'text' | 'number';
}

/** Поле формы предложения с подписью и единицей измерения. */
export function OfferField({
    id,
    label,
    value,
    onChange,
    suffix,
    hint,
    placeholder,
    disabled,
    type = 'number',
}: OfferFieldProps) {
    return (
        <div className="space-y-1.5">
            <Label htmlFor={id} className="text-xs text-muted-foreground">
                {label}
            </Label>
            <div className="relative">
                <Input
                    id={id}
                    type={type === 'number' ? 'text' : type}
                    inputMode={type === 'number' ? 'numeric' : undefined}
                    value={value}
                    disabled={disabled}
                    placeholder={placeholder}
                    maxLength={255}
                    onChange={event => onChange(event.target.value)}
                    className={suffix ? 'pr-10' : undefined}
                />
                {suffix ? (
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                        {suffix}
                    </span>
                ) : null}
            </div>
            {hint ? (
                <p className="text-xs text-muted-foreground">{hint}</p>
            ) : null}
        </div>
    );
}
