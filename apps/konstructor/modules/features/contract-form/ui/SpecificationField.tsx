'use client';

import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Textarea } from '@workspace/ui/components/textarea';
import type { ContractSpecificationItem } from '@/modules/entities/contract-document';
import { specificationRows, specificationText } from '../lib/specification-sections.util';

export interface SpecificationFieldProps {
    item: ContractSpecificationItem;
    onChange: (code: string, value: string) => void;
}

/** Строка спецификации: подпись и поле; серые (isDisable) собирает бэк. */
export const SpecificationField = ({ item, onChange }: SpecificationFieldProps) => {
    const id = `spec-${item.code}`;
    const value = specificationText(item);

    return (
        <div className="flex flex-col gap-1">
            <Label htmlFor={id}>
                {item.name}
                {item.isRequired ? <span className="text-destructive"> *</span> : null}
            </Label>
            {item.type === 'text' ? (
                <Textarea
                    id={id}
                    value={value}
                    disabled={item.isDisable}
                    rows={specificationRows(value)}
                    onChange={event => onChange(item.code, event.target.value)}
                />
            ) : (
                <Input
                    id={id}
                    value={value}
                    disabled={item.isDisable}
                    onChange={event => onChange(item.code, event.target.value)}
                />
            )}
        </div>
    );
};
