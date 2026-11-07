'use client';

import { useMemo } from 'react';
import { FieldCombobox, type ComboboxOption } from '@workspace/april-ui/fields';
import { EMPLOYEES_TEXT as TEXT } from '../consts/employees.const';
import { employeeName } from '../lib/employee-ids';
import { useEmployeeOptions } from '../lib/hooks/use-employee-options';
import { EmployeesPickerStatus } from './EmployeesPickerStatus';

interface EmployeePickerProps {
    portalId: number;
    /** Выбранный Bitrix-id; 0 — никто. */
    id: number;
    onChange: (id: number) => void;
    /** Есть вариант «Никто» (значение 0). */
    allowNone?: boolean;
    disabled?: boolean;
    inputId?: string;
}

const NONE_VALUE = '0';

/**
 * Один сотрудник портала: поиск по имени, должности, отделу или id.
 * Выбранный id, которого нет среди активных, остаётся в списке с
 * пометкой «не найден», чтобы значение не пропало при открытии формы.
 */
export const EmployeePicker = ({
    portalId,
    id,
    onChange,
    allowNone,
    disabled,
    inputId,
}: EmployeePickerProps) => {
    const employees = useEmployeeOptions(portalId);

    const options = useMemo<ComboboxOption[]>(() => {
        const list: ComboboxOption[] = [];
        if (allowNone) list.push({ value: NONE_VALUE, label: TEXT.none });
        if (id > 0 && !employees.byId.has(id)) {
            list.push({
                value: String(id),
                label: employeeName(id, employees.byId),
            });
        }
        return [...list, ...employees.options];
    }, [allowNone, id, employees.byId, employees.options]);

    const value = id > 0 ? String(id) : allowNone ? NONE_VALUE : undefined;

    return (
        <div className="max-w-md space-y-1.5">
            <FieldCombobox
                id={inputId}
                options={options}
                value={value}
                onChange={next => onChange(Number(next))}
                placeholder={TEXT.pick}
                searchPlaceholder={TEXT.search}
                emptyText={TEXT.empty}
                disabled={disabled || employees.isLoading}
            />
            <EmployeesPickerStatus
                isLoading={employees.isLoading}
                isError={employees.isError}
                isRefreshing={employees.isRefreshing}
                onRefresh={employees.refresh}
            />
        </div>
    );
};
