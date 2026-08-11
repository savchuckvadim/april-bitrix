'use client';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { LEAD_REQUEST_TEXT } from '../consts/lead-request.const';
import type { LeadRequestItem } from '../model';

interface LeadRequestEnumFieldProps<TCode extends string> {
    label: string;
    installed: boolean;
    currentCode: TCode | null | undefined;
    items: LeadRequestItem[];
    disabled: boolean;
    onChange: (code: TCode) => void;
}

/**
 * Чистый селект одного enum-поля карточки; скрыт, если поле не установлено.
 *
 * Generic по коду поля: каждый вызов получает автокомплит своего union'а
 * (LeadSiteStatusStateDtoCurrentCode и т.д.). Items приходят с бэка со
 * string-кодами — единственная точка приведения к TCode здесь, значения
 * гарантированы серверной картой items того же поля.
 */
export const LeadRequestEnumField = <TCode extends string>({
    label,
    installed,
    currentCode,
    items,
    disabled,
    onChange,
}: LeadRequestEnumFieldProps<TCode>) => {
    if (!installed) return null;
    return (
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            {label}
            <Select
                value={currentCode ?? undefined}
                onValueChange={value => onChange(value as TCode)}
                disabled={disabled}
            >
                <SelectTrigger className="h-8 text-xs">
                    <SelectValue
                        placeholder={LEAD_REQUEST_TEXT.selectPlaceholder}
                    />
                </SelectTrigger>
                <SelectContent>
                    {items.map(item => (
                        <SelectItem key={item.code} value={item.code}>
                            {item.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </label>
    );
};
