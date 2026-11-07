'use client';

import {
    EmployeePicker,
    EmployeesPicker,
    formatEmployeeIds,
    parseEmployeeIds,
} from '@/modules/entities/portal/employees';
import type {
    PortalAppSettingDescriptor,
    PortalAppSettingValue,
} from '../../../model';

interface AppSettingEmployeeFieldProps {
    portalId: number;
    descriptor: PortalAppSettingDescriptor;
    /** Действующее значение: черновик или сохранённое; null — дефолт. */
    value: PortalAppSettingValue;
    onChange: (value: PortalAppSettingValue) => void;
}

/**
 * Настройка-сотрудники (`pick` в дескрипторе бэка): выбор из сотрудников
 * портала вместо ввода Bitrix-id цифрами.
 * - `bitrix-users` — CSV «447, 12»; пустой выбор = null (сброс на дефолт,
 *   у этих ключей он пустой);
 * - `bitrix-user` — одно число; «Никто» = 0.
 */
export const AppSettingEmployeeField = ({
    portalId,
    descriptor,
    value,
    onChange,
}: AppSettingEmployeeFieldProps) => {
    if (descriptor.pick === 'bitrix-user') {
        const current =
            value === null ? Number(descriptor.default) || 0 : Number(value) || 0;
        return (
            <EmployeePicker
                portalId={portalId}
                id={current}
                allowNone
                onChange={id => onChange(id)}
            />
        );
    }
    return (
        <EmployeesPicker
            portalId={portalId}
            ids={parseEmployeeIds(value ?? descriptor.default)}
            onChange={ids =>
                onChange(ids.length > 0 ? formatEmployeeIds(ids) : null)
            }
        />
    );
};
