'use client';

import { FC } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { EV_COMPANY_PROP } from '../model/EventCompanySlice';
import { updateCompany } from '../model/EventCompanyThunk';

/**
 * Статус клиента компактным чипом.
 *
 * Значений около десяти — сегменты тут не годятся, селект оправдан. Но лейбл
 * с полем во всю ширину для значения, которое меняют раз в полгода, — перебор:
 * в шапке это чип по ширине содержимого.
 */
export const ClientStatusChip: FC = () => {
    const dispatch = useAppDispatch();
    const status = useAppSelector(s => s.company.status);

    if (!status.field || !status.items.length) return null;

    const current =
        status.current && typeof status.current === 'object'
            ? status.current.code
            : undefined;

    return (
        <Select
            value={current}
            disabled={status.isLoading}
            onValueChange={code =>
                dispatch(updateCompany(EV_COMPANY_PROP.STATUS, code))
            }
        >
            <SelectTrigger
                size="sm"
                aria-label="Статус клиента"
                className="h-7 w-auto gap-1 border-dashed px-2 text-xs"
            >
                <SelectValue placeholder="Статус клиента" />
            </SelectTrigger>
            <SelectContent>
                {status.items.map(item => (
                    <SelectItem key={item.code} value={item.code}>
                        {item.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};
