'use client';

import { FC } from 'react';
import { ChipSelect } from '@workspace/april-ui/fields';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { EV_COMPANY_PROP } from '../model/EventCompanySlice';
import { updateCompany } from '../model/EventCompanyThunk';

/**
 * Статус клиента компактным чипом.
 *
 * Значений около десяти — сегменты тут не годятся, селект оправдан. Но лейбл
 * с полем во всю ширину для значения, которое меняют раз в полгода, — перебор:
 * в шапке это компактный чип (общий с конструктором — ChipSelect).
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
        <ChipSelect
            value={current}
            options={status.items}
            disabled={status.isLoading}
            onChange={code =>
                dispatch(updateCompany(EV_COMPANY_PROP.STATUS, code))
            }
            ariaLabel="Статус клиента"
            placeholder="Статус клиента"
        />
    );
};
