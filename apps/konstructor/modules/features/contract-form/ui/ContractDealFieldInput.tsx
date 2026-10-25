'use client';

import { MicroSpinner } from '@workspace/april-ui/feedback';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import type { ContractDealFieldType } from '@/modules/entities/contract-document';

export interface ContractDealFieldInputProps {
    id: string;
    label: string;
    type: ContractDealFieldType;
    value: string;
    required?: boolean;
    saving?: boolean;
    onChange: (value: string) => void;
    onBlur?: () => void;
}

const INPUT_TYPE: Record<ContractDealFieldType, string> = {
    date: 'date',
    string: 'text',
    email: 'email',
};

/** Поле сделки для договора: подпись с отметкой обязательности, ввод, индикатор записи в Bitrix. */
export const ContractDealFieldInput = ({
    id,
    label,
    type,
    value,
    required,
    saving,
    onChange,
    onBlur,
}: ContractDealFieldInputProps) => (
    <div className="flex flex-col gap-1">
        <Label htmlFor={id} className="flex items-center gap-1">
            {label}
            {required ? <span className="text-destructive">*</span> : null}
            {saving ? <MicroSpinner size={12} /> : null}
        </Label>
        <Input
            id={id}
            type={INPUT_TYPE[type]}
            value={value}
            aria-invalid={required && !value ? true : undefined}
            onChange={event => onChange(event.target.value)}
            onBlur={onBlur}
        />
    </div>
);
