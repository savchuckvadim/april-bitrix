'use client';

import { Checkbox } from '@workspace/ui/components/checkbox';
import { Label } from '@workspace/ui/components/label';
import { PROVIDER_TAX_TEXT } from '../../model';

interface WithTaxFieldProps {
    id: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}

/** Флажок «Работает с НДС» поставщика: общий для формы создания и правки. */
export function WithTaxField({ id, checked, onChange }: WithTaxFieldProps) {
    return (
        <div className="space-y-1">
            <div className="flex items-center gap-2">
                <Checkbox
                    id={id}
                    checked={checked}
                    onCheckedChange={value => onChange(value === true)}
                />
                <Label htmlFor={id}>{PROVIDER_TAX_TEXT.label}</Label>
            </div>
            <p className="text-xs text-muted-foreground">{PROVIDER_TAX_TEXT.hint}</p>
        </div>
    );
}
