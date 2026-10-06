'use client';

import { FC } from 'react';
import { SectionCard } from '@workspace/april-ui/surfaces';
import type { PurchaseSignalsView } from '../lib/hooks/use-purchase-signals';
import { PurchaseDateInput } from './PurchaseDateInput';

/**
 * «Покупка и договор» — свои сроки клиента: когда планирует купить, срок
 * действующего договора и подарочный период (владелец, 05.10.2026).
 *
 * Даты «с / по» стоят парами в две колонки, одиночная плановая дата
 * занимает строку целиком.
 */
export const ContractDatesCard: FC<{ signals: PurchaseSignalsView }> = ({
    signals,
}) => (
    <SectionCard
        title="Покупка и договор"
        density="compact"
        collapsible
        defaultOpen
    >
        <div className="grid grid-cols-2 gap-2">
            {signals.contractDates.map(date => (
                <PurchaseDateInput key={date.code} date={date} />
            ))}
        </div>
    </SectionCard>
);
