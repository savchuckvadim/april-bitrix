'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import type { PresentationOption } from '../hooks/use-offer-presentation';

export interface PresentationPickerProps {
    /** Презентации сделки: название и дата */
    options: PresentationOption[];
    /** Номер выбранной сделки презентации; пусто — выбора ещё нет */
    value: string;
    onChange: (value: string) => void;
    /** Подсказка под списком, пока презентация не выбрана */
    hint: string | null;
}

/** Выбор презентации из нескольких: по умолчанию пусто, КП без выбора не формируется. */
export const PresentationPicker = ({ options, value, onChange, hint }: PresentationPickerProps) => (
    <div className="flex flex-col gap-1">
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="w-full" aria-label="Презентация, после которой отправляется КП">
                <SelectValue placeholder="Выберите презентацию" />
            </SelectTrigger>
            <SelectContent>
                {options.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
        {hint ? <p className="text-xs text-warning">{hint}</p> : null}
    </div>
);
