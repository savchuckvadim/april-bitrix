'use client';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { APP_SETTINGS_TEXT } from '../../../consts/app-settings.const';
import {
    buildChoiceItems,
    fromChoiceValue,
    toChoiceValue,
} from '../../../lib/setting-choice';
import type {
    PortalAppSettingOption,
    PortalAppSettingValue,
} from '../../../model';

interface AppSettingChoiceFieldProps {
    /** Справочник допустимых кодов — его отдаёт бэк вместе с настройкой. */
    options: readonly PortalAppSettingOption[];
    /** Дефолт кода — подпись пункта «По умолчанию». */
    defaultValue: unknown;
    /** Текущее действующее значение: код опции либо `null`. */
    value: PortalAppSettingValue;
    onChange: (value: PortalAppSettingValue) => void;
}

/**
 * Настройка-выбор: одно значение из справочника вместо свободного ввода.
 * Бэк присылает `options` без `isList` (`bitrix_rate_plan`,
 * `deal_audit_frequency`, `visibility_employee_default`): опечатка в
 * свободном поле молча означала бы «дефолт», потребители такие значения
 * отбрасывают.
 */
export const AppSettingChoiceField = ({
    options,
    defaultValue,
    value,
    onChange,
}: AppSettingChoiceFieldProps) => {
    const items = buildChoiceItems(options, defaultValue, value, {
        defaultHint: APP_SETTINGS_TEXT.defaultHint,
        foreignHint: APP_SETTINGS_TEXT.foreignOptionHint,
    });

    return (
        <Select
            value={toChoiceValue(value)}
            onValueChange={next => onChange(fromChoiceValue(next))}
        >
            <SelectTrigger className="w-72">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {items.map(item => (
                    <SelectItem key={item.value} value={item.value}>
                        {item.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};
