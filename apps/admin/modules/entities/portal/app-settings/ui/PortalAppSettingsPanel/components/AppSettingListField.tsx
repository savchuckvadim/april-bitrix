'use client';

import { Checkbox } from '@workspace/ui/components/checkbox';
import { formatSettingList, parseSettingList } from '../../../lib/setting-list';
import type {
    PortalAppSettingOption,
    PortalAppSettingValue,
} from '../../../model';

interface AppSettingListFieldProps {
    /** Справочник допустимых кодов — его отдаёт бэк вместе с настройкой. */
    options: PortalAppSettingOption[];
    /** Текущее действующее значение: CSV кодов либо `null`. */
    value: PortalAppSettingValue;
    onChange: (value: PortalAppSettingValue) => void;
}

/**
 * Настройка-список: выбор из справочника, а не строка через запятую.
 *
 * Бэк помечает такую настройку `isList` и присылает `options`. Без этого
 * поля владелец набирал бы коды типов события руками — и опечатка молча
 * превращалась бы в «выключено ничего»: коды не из реестра бэк при чтении
 * выбрасывает.
 */
export const AppSettingListField = ({
    options,
    value,
    onChange,
}: AppSettingListFieldProps) => {
    const current = parseSettingList(value);
    const picked = new Set(current);

    // Коды, которых нет в справочнике, сохраняются как есть: их мог
    // поставить прежний релиз бэка, и стирать их отметкой соседнего
    // значения — молчаливая правка чужого выбора.
    const toggle = (code: string, isPicked: boolean) => {
        const rest = current.filter(item => item !== code);
        onChange(formatSettingList(isPicked ? [...rest, code] : rest));
    };

    return (
        <div className="flex flex-wrap gap-x-4 gap-y-2">
            {options.map(option => (
                <label
                    key={option.code}
                    className="flex items-center gap-2 text-sm"
                >
                    <Checkbox
                        checked={picked.has(option.code)}
                        onCheckedChange={checked =>
                            toggle(option.code, checked === true)
                        }
                    />
                    {option.name}
                </label>
            ))}
        </div>
    );
};
