'use client';

import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { Textarea } from '@workspace/ui/components/textarea';
import {
    selectValueOf,
    textValueOf,
    type SupplyFormFile,
    type SupplyFormItem,
} from '@/modules/entities/supply-report-document';

export interface SupplyFieldInputProps {
    item: SupplyFormItem;
    file?: SupplyFormFile;
    onText: (value: string) => void;
    onSelect: (optionCode: string) => void;
    onFile: (file: File | null) => void;
}

/** Поле формы отчёта по типу: select / date / string / text / file. */
export const SupplyFieldInput = ({ item, file, onText, onSelect, onFile }: SupplyFieldInputProps) => {
    const id = `supply-${item.code}`;
    const label = (
        <Label htmlFor={id}>
            {item.name}
            {item.isRequired ? <span className="text-destructive"> *</span> : null}
        </Label>
    );

    if (item.type === 'select') {
        return (
            <div className="flex flex-col gap-1">
                {label}
                <Select value={selectValueOf(item)?.code ?? ''} onValueChange={onSelect} disabled={item.isDisable}>
                    <SelectTrigger id={id}>
                        <SelectValue placeholder="Выберите" />
                    </SelectTrigger>
                    <SelectContent>
                        {(item.items ?? []).map(option => (
                            <SelectItem key={option.code} value={option.code}>
                                {option.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        );
    }

    if (item.type === 'file') {
        const current = file?.filename ?? (typeof item.value === 'string' ? item.value : '');
        return (
            <div className="flex flex-col gap-1">
                {label}
                <Input
                    id={id}
                    type="file"
                    disabled={item.isDisable}
                    onChange={event => onFile(event.target.files?.[0] ?? null)}
                />
                {current ? <p className="text-xs text-muted-foreground">Файл: {current}</p> : null}
            </div>
        );
    }

    if (item.type === 'text') {
        return (
            <div className="flex flex-col gap-1 sm:col-span-2">
                {label}
                <Textarea
                    id={id}
                    value={textValueOf(item)}
                    disabled={item.isDisable}
                    rows={3}
                    onChange={event => onText(event.target.value)}
                />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-1">
            {label}
            <Input
                id={id}
                type={item.type === 'date' ? 'date' : 'text'}
                value={textValueOf(item)}
                disabled={item.isDisable}
                onChange={event => onText(event.target.value)}
            />
        </div>
    );
};
