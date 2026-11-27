'use client';

import { MicroSelect } from '@workspace/april-ui/fields';
import type { CheckOption } from '../lib/check-criteria.util';

export interface InvoiceCheckSelectProps {
    label: string;
    value: string;
    options: readonly CheckOption[];
    onChange: (value: string) => void;
}

/** Подписанный селект одного признака в строке проверки подбора. */
export const InvoiceCheckSelect = ({
    label,
    value,
    options,
    onChange,
}: InvoiceCheckSelectProps) => (
    <div className="flex items-center gap-1.5">
        <span className="text-xs text-muted-foreground">{label}</span>
        <MicroSelect
            ariaLabel={label}
            value={value}
            options={[...options]}
            onChange={onChange}
            className="max-w-48"
        />
    </div>
);
