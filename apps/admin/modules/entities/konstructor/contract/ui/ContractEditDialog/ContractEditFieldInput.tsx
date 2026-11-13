'use client';

import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Textarea } from '@workspace/ui/components/textarea';
import type { ContractEditField } from '../../model';

export interface ContractEditFieldInputProps {
    field: ContractEditField;
    value: string;
    invalid: boolean;
    onChange: (value: string) => void;
}

/** Одно текстовое поле вида договора: подпись, ввод, где видно значение. */
export function ContractEditFieldInput({ field, value, invalid, onChange }: ContractEditFieldInputProps) {
    const id = `contract-edit-${field.key}`;

    return (
        <div className="space-y-1.5">
            <Label htmlFor={id}>
                {field.label}
                {field.required ? <span className="text-destructive"> *</span> : null}
            </Label>
            {field.multiline ? (
                <Textarea
                    id={id}
                    rows={3}
                    value={value}
                    aria-invalid={invalid}
                    onChange={event => onChange(event.target.value)}
                />
            ) : (
                <Input
                    id={id}
                    maxLength={255}
                    value={value}
                    aria-invalid={invalid}
                    onChange={event => onChange(event.target.value)}
                />
            )}
            {invalid ? (
                <p className="text-xs text-destructive">Поле не может быть пустым.</p>
            ) : field.hint ? (
                <p className="text-xs text-muted-foreground">{field.hint}</p>
            ) : null}
        </div>
    );
}
