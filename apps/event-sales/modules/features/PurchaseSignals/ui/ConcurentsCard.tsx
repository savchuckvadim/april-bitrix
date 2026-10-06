'use client';

import { FC } from 'react';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { Label } from '@workspace/ui/components/label';
import { ChoiceChips } from '@/modules/shared/ui/ChoiceChips';
import type { PurchaseSignalsView } from '../lib/hooks/use-purchase-signals';
import { PurchaseDateInput } from './PurchaseDateInput';

/**
 * «Конкуренты» — кто держит клиента и до какого срока.
 *
 * Справочник и сроки живут вместе: клиент освобождается, когда у конкурента
 * кончается оплата или договор. Выбор пишется в CRM сразу, как и даты.
 */
export const ConcurentsCard: FC<{ signals: PurchaseSignalsView }> = ({
    signals,
}) => (
    <SectionCard title="Конкуренты" density="compact" collapsible defaultOpen>
        <div className="space-y-2">
            {signals.concurents.options.length > 0 && (
                <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                        Кто работает с клиентом
                    </Label>
                    <ChoiceChips
                        ariaLabel="Конкуренты"
                        options={signals.concurents.options}
                        selected={signals.concurents.selected}
                        onToggle={signals.concurents.toggle}
                    />
                </div>
            )}

            {signals.concurentDates.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                    {signals.concurentDates.map(date => (
                        <PurchaseDateInput key={date.code} date={date} />
                    ))}
                </div>
            )}
        </div>
    </SectionCard>
);
