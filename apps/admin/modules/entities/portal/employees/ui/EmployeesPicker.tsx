'use client';

import { X } from 'lucide-react';
import { FieldCombobox } from '@workspace/april-ui/fields';
import { EMPLOYEES_TEXT as TEXT } from '../consts/employees.const';
import { employeeName } from '../lib/employee-ids';
import { useEmployeeOptions } from '../lib/hooks/use-employee-options';
import { EmployeesPickerStatus } from './EmployeesPickerStatus';

interface EmployeesPickerProps {
    portalId: number;
    /** Выбранные Bitrix-id в порядке добавления. */
    ids: readonly number[];
    onChange: (ids: number[]) => void;
    disabled?: boolean;
}

/**
 * Несколько сотрудников портала: выбранные — плашками с именем и
 * «убрать», добавление — поиском по имени, должности, отделу или id.
 * Id, которого нет среди активных (уволен, опечатка прошлых лет), остаётся
 * плашкой «id N (не найден)» — молча он не пропадает.
 */
export const EmployeesPicker = ({
    portalId,
    ids,
    onChange,
    disabled,
}: EmployeesPickerProps) => {
    const employees = useEmployeeOptions(portalId);
    const picked = new Set(ids);
    const available = employees.options.filter(
        option => !picked.has(Number(option.value)),
    );

    return (
        <div className="max-w-xl space-y-2">
            {ids.length > 0 ? (
                <ul className="flex flex-wrap gap-1.5">
                    {ids.map(id => (
                        <li
                            key={id}
                            className="inline-flex items-center gap-1 rounded-md border bg-muted/40 py-0.5 pl-2 pr-1 text-sm"
                            title={`Bitrix-id ${id}`}
                        >
                            {employeeName(id, employees.byId)}
                            <button
                                type="button"
                                className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
                                aria-label={`${TEXT.remove}: ${employeeName(id, employees.byId)}`}
                                disabled={disabled}
                                onClick={() =>
                                    onChange(ids.filter(item => item !== id))
                                }
                            >
                                <X aria-hidden className="size-3.5" />
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-muted-foreground">{TEXT.nobody}</p>
            )}
            <FieldCombobox
                options={available}
                value={undefined}
                onChange={value => onChange([...ids, Number(value)])}
                placeholder={TEXT.add}
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
