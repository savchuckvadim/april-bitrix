'use client';

import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';

interface MonthsFieldProps {
    id: string;
    label: string;
    /** Значение как ввёл владелец — валидность считается снаружи. */
    value: string;
    isValid: boolean;
    min: number;
    max: number;
    hint: string;
    invalidHint: string;
    onChange: (raw: string) => void;
}

/**
 * Поле «месяцев» — общее для формы запуска аудита и пробы истории стадий:
 * число в границах бэка, подсказка под полем сменяется текстом ошибки при
 * невалидном вводе. Границы у форм разные (1–24 и 1–36) — приходят пропсами.
 */
export const MonthsField = ({
    id,
    label,
    value,
    isValid,
    min,
    max,
    hint,
    invalidHint,
    onChange,
}: MonthsFieldProps) => (
    <div className="space-y-1.5">
        <Label htmlFor={id} className="text-xs font-semibold">
            {label}
        </Label>
        <Input
            id={id}
            type="number"
            inputMode="numeric"
            min={min}
            max={max}
            step={1}
            value={value}
            aria-invalid={!isValid}
            onChange={event => onChange(event.target.value)}
        />
        <p
            className={
                isValid
                    ? 'text-xs text-muted-foreground'
                    : 'text-xs text-destructive'
            }
        >
            {isValid ? hint : invalidHint}
        </p>
    </div>
);
