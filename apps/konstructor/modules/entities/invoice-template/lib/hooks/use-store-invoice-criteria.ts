'use client';

import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    selectInvoiceClientType,
    selectInvoiceSupplyType,
} from '../select-invoice-criteria';

/**
 * Признаки подбора шаблона счёта из состояния конструктора: домен портала,
 * выбранный поставщик, тип клиента из шапки и тип поставки главной строки.
 */
export const useStoreInvoiceCriteria = () => {
    const domain = useAppSelector(state => state.app.domain);
    const providerId = useAppSelector(
        state => state.documentProvider.current?.id ?? null,
    );
    const clientType = useAppSelector(selectInvoiceClientType);
    const supplyType = useAppSelector(selectInvoiceSupplyType);

    return { domain, providerId, clientType, supplyType };
};
