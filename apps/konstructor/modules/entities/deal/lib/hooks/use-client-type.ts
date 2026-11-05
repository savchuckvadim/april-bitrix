'use client';

import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { DEFAULT_CLIENT_TYPE } from '../utils/get-deal-client-type.util';
import { selectResolvedClientType } from '../utils/select-client-type.util';

/**
 * Тип клиента: компания (чип в шапке) → сделка. `clientType` — null, когда
 * нигде не задан; `resolved` — тот же тип с фолбэком «организация» для
 * реквизитов и документов.
 */
export const useClientType = () => {
    const resolved = useAppSelector(selectResolvedClientType);

    return {
        clientType: resolved.type,
        resolved: resolved.type ?? DEFAULT_CLIENT_TYPE,
        source: resolved.source,
    };
};
