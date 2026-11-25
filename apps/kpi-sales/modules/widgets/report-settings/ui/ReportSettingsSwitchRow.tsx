'use client';

import type { ReactNode } from 'react';
import { Label } from '@workspace/ui/components/label';
import { Switch } from '@workspace/ui/components/switch';

interface ReportSettingsSwitchRowProps {
    id: string;
    label: ReactNode;
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    /** Пояснение при наведении, например почему переключатель заблокирован. */
    hint?: string;
}

/** Строка настройки: переключатель и подпись справа — клик по подписи тоже переключает. */
export const ReportSettingsSwitchRow = ({
    id,
    label,
    checked,
    onChange,
    disabled,
    hint,
}: ReportSettingsSwitchRowProps) => (
    <div className="flex items-center gap-3 py-1" title={hint}>
        <Switch id={id} checked={checked} onCheckedChange={onChange} disabled={disabled} />
        <Label
            htmlFor={id}
            className={
                disabled
                    ? 'text-sm font-normal text-muted-foreground'
                    : 'cursor-pointer text-sm font-normal'
            }
        >
            {label}
        </Label>
    </div>
);
