'use client';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';

export interface RequisiteSelectProps {
    items: Array<{ id: string; title: string }>;
    currentId: string | null;
    placeholder: string;
    disabled?: boolean;
    onSelect: (id: string) => void;
}

/** Сохранённые реквизиты типа клиента; текущий — выбранный. */
export const RequisiteSelect = ({
    items,
    currentId,
    placeholder,
    disabled,
    onSelect,
}: RequisiteSelectProps) => (
    <Select value={currentId ?? ''} onValueChange={onSelect} disabled={disabled || !items.length}>
        <SelectTrigger className="min-w-64">
            <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
            {items.map(item => (
                <SelectItem key={item.id} value={item.id}>
                    {item.title}
                </SelectItem>
            ))}
        </SelectContent>
    </Select>
);
