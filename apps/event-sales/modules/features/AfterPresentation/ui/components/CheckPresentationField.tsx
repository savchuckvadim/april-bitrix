'use client';

import { FC } from 'react';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Switch } from '@workspace/ui/components/switch';
import { Textarea } from '@workspace/ui/components/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import {
    CheckPresentationFieldType,
    CheckPresentationItem,
    CheckPresentationValue,
} from '../../type/check-presentation-type';

interface CheckPresentationFieldProps {
    item: CheckPresentationItem;
    value: CheckPresentationValue | undefined;
    isMissing: boolean;
    onChange: (value: CheckPresentationValue) => void;
}

/** Одно поле опросника: рендер по типу (string/boolean/date/enumeration). */
export const CheckPresentationField: FC<CheckPresentationFieldProps> = ({
    item,
    value,
    isMissing,
    onChange,
}) => {
    return (
        <div className="space-y-1.5">
            <Label className={isMissing ? 'text-destructive' : undefined}>
                {item.title}
                {item.required && ' *'}
            </Label>

            {item.type === CheckPresentationFieldType.STRING && (
                <Textarea
                    rows={2}
                    value={typeof value === 'string' ? value : ''}
                    placeholder={item.placeholder}
                    aria-invalid={isMissing}
                    onChange={e => onChange(e.target.value)}
                />
            )}

            {item.type === CheckPresentationFieldType.BOOLEAN && (
                <div className="flex items-center gap-2">
                    <Switch
                        checked={value === true}
                        onCheckedChange={checked => onChange(checked)}
                    />
                    <span className="text-sm text-muted-foreground">
                        {value === true ? 'Да' : 'Нет'}
                    </span>
                </div>
            )}

            {item.type === CheckPresentationFieldType.DATE && (
                <Input
                    type="date"
                    value={typeof value === 'string' ? value : ''}
                    aria-invalid={isMissing}
                    onChange={e => onChange(e.target.value)}
                />
            )}

            {item.type === CheckPresentationFieldType.ENUMERATION && (
                <Select
                    value={typeof value === 'string' ? value : undefined}
                    onValueChange={onChange}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder={item.placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                        {(item.options ?? []).map(option => (
                            <SelectItem key={option.code} value={option.code}>
                                {option.title}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}
        </div>
    );
};
