'use client';

import { FC } from 'react';
import { MicroField } from '@workspace/april-ui';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { LEAD_REQUEST_ENUM_LABEL } from '../consts/lead-request.const';
import { useLeadRequestNotCa } from '../lib/hooks/use-lead-request-not-ca';
import type { LeadNotCaTypeCode } from '../model';

/**
 * Селект «Тип не ЦА»: значение уезжает в leadSync финального payload'а
 * (не пишется в лид мгновенно — только с отправкой отчёта). Items берутся
 * из слепка портала — работает и по сделке без заявки. Скрыт, пока поля
 * нет ни в слепке, ни в карточке.
 */
export const LeadRequestNotCaSelect: FC<{ required?: boolean }> = ({
    required = false,
}) => {
    const { visible, items, value, setValue } = useLeadRequestNotCa();
    if (!visible) return null;

    const select = (
        <Select
            value={value ?? undefined}
            onValueChange={code => setValue(code as LeadNotCaTypeCode)}
        >
            <SelectTrigger
                size="sm"
                aria-label={LEAD_REQUEST_ENUM_LABEL.notCaTypeCode}
                className={required ? 'w-56' : 'w-full'}
            >
                <SelectValue
                    placeholder={LEAD_REQUEST_ENUM_LABEL.notCaTypeCode}
                />
            </SelectTrigger>
            <SelectContent>
                {items.map(item => (
                    <SelectItem key={item.code} value={item.code}>
                        {item.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );

    // В пульте селект стоит в общей строке — с подписью и меткой
    // обязательности тем же кеглем, что остальные поля отчёта.
    if (required) {
        return (
            <MicroField label={LEAD_REQUEST_ENUM_LABEL.notCaTypeCode} required>
                {select}
            </MicroField>
        );
    }

    return select;
};
