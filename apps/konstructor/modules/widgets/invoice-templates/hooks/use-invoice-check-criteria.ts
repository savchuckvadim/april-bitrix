'use client';

import { useMemo, useState } from 'react';
import {
    INVOICE_CLIENT_TYPE_CODES,
    INVOICE_CLIENT_TYPE_OPTIONS,
    INVOICE_SUPPLY_TYPE_CODES,
    INVOICE_SUPPLY_TYPE_OPTIONS,
    useStoreInvoiceCriteria,
    type InvoiceClientType,
    type InvoiceSupplyType,
    type InvoiceTemplateCriteria,
} from '@/modules/entities/invoice-template';
import type { Provider } from '@/modules/entities/provider';
import {
    fromCheckValue,
    toCheckValue,
    withAnyOption,
    type CheckOption,
} from '../lib/check-criteria.util';

/**
 * Выбор менеджера поверх состояния конструктора: `undefined` значит «как в
 * конструкторе», `null` значит «не задан».
 */
interface Picked {
    providerId?: string | null;
    clientType?: InvoiceClientType | null;
    supplyType?: InvoiceSupplyType | null;
}

/**
 * Признаки для проверки «какой шаблон уйдёт». По умолчанию их задаёт
 * конструктор (поставщик, тип клиента шапки, поставка главной строки), а на
 * экране настроек сделки может не быть, поэтому каждый можно выбрать руками.
 */
export const useInvoiceCheckCriteria = (providers: readonly Provider[]) => {
    const store = useStoreInvoiceCriteria();
    const [picked, setPicked] = useState<Picked>({});

    const providerId =
        picked.providerId !== undefined ? picked.providerId : store.providerId;
    const clientType =
        picked.clientType !== undefined ? picked.clientType : store.clientType;
    const supplyType =
        picked.supplyType !== undefined ? picked.supplyType : store.supplyType;

    const criteria = useMemo<InvoiceTemplateCriteria | null>(
        () =>
            store.domain
                ? {
                      domain: store.domain,
                      providerId: providerId ? Number(providerId) || null : null,
                      clientType,
                      supplyType,
                  }
                : null,
        [store.domain, providerId, clientType, supplyType],
    );

    const providerOptions = useMemo<CheckOption[]>(
        () =>
            withAnyOption(
                'Без поставщика',
                providers.map(provider => ({
                    value: provider.id,
                    label: provider.name,
                })),
            ),
        [providers],
    );

    return {
        criteria,
        providerValue: toCheckValue(providerId),
        clientValue: toCheckValue(clientType),
        supplyValue: toCheckValue(supplyType),
        providerOptions,
        clientOptions: withAnyOption('Не задан', INVOICE_CLIENT_TYPE_OPTIONS),
        supplyOptions: withAnyOption('Не задан', INVOICE_SUPPLY_TYPE_OPTIONS),
        isCustom: Object.keys(picked).length > 0,
        pickProvider: (value: string) =>
            setPicked(prev => ({
                ...prev,
                providerId: providers.find(item => item.id === value)?.id ?? null,
            })),
        pickClientType: (value: string) =>
            setPicked(prev => ({
                ...prev,
                clientType: fromCheckValue(value, INVOICE_CLIENT_TYPE_CODES),
            })),
        pickSupplyType: (value: string) =>
            setPicked(prev => ({
                ...prev,
                supplyType: fromCheckValue(value, INVOICE_SUPPLY_TYPE_CODES),
            })),
        resetPicked: () => setPicked({}),
    };
};

export type InvoiceCheckState = ReturnType<typeof useInvoiceCheckCriteria>;
