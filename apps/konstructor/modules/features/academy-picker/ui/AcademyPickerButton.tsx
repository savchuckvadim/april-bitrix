'use client';

import { Check, GraduationCap } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Popover, PopoverContent, PopoverTrigger } from '@workspace/ui/components/popover';
import type { RowSet } from '@/modules/entities/row-set';
import { useAcademyPicker } from '../hooks/use-academy-picker';
import { AcademyPackageList } from './AcademyPackageList';

export interface AcademyPickerButtonProps {
    set: RowSet;
}

/**
 * Кнопка «Академия» у набора на шаге цен (легаси AcademyInitButton):
 * галочка — пакет выбран; подсветка — выбран, но под срок сделки не
 * подходит, строки в наборе нет.
 */
export const AcademyPickerButton = ({ set }: AcademyPickerButtonProps) => {
    const picker = useAcademyPicker(set);
    if (!picker.canPick) return null;
    const hours = picker.current ? `${picker.current.totalHours} ч` : null;
    const title = !picker.current
        ? 'Академия ГАРАНТ'
        : picker.currentFits
          ? `Академия ГАРАНТ: ${hours}`
          : `Академия ГАРАНТ: ${hours} — не под срок сделки, строки нет`;

    return (
        <Popover open={picker.open} onOpenChange={picker.setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant={picker.current ? 'secondary' : 'outline'}
                    size="sm"
                    title={title}
                    className={picker.current && !picker.currentFits ? 'text-warning' : undefined}
                >
                    {picker.current ? <Check aria-hidden /> : <GraduationCap aria-hidden />}
                    {hours ? `Академия: ${hours}` : 'Академия'}
                </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="max-h-96 w-96 max-w-[90vw] overflow-y-auto p-2">
                <AcademyPackageList picker={picker} />
            </PopoverContent>
        </Popover>
    );
};
