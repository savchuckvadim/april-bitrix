'use client';

import { FC } from 'react';
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
 * Селект «Тип не ЦА» для блока отказа в форме отчёта: значение уезжает в
 * leadSync финального payload'а (не пишется в лид мгновенно — только с
 * отправкой отчёта). Скрыт, пока нет карточки заявки/поля на портале.
 */
export const LeadRequestNotCaSelect: FC = () => {
    const { visible, items, value, setValue } = useLeadRequestNotCa();
    if (!visible) return null;

    return (
        <Select
            value={value ?? undefined}
            onValueChange={code => setValue(code as LeadNotCaTypeCode)}
        >
            <SelectTrigger
                size="sm"
                aria-label={LEAD_REQUEST_ENUM_LABEL.notCaTypeCode}
                className="w-full"
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
};
