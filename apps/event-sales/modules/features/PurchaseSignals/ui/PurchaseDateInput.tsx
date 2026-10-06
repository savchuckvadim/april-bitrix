'use client';

import { FC, useState } from 'react';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { cn } from '@workspace/ui/lib/utils';
import type { PurchaseDateView } from '../lib/hooks/use-purchase-signals';

/**
 * Одна дата карточки: подпись и поле.
 *
 * Черновик живёт здесь: клавиатурный ввод даёт промежуточные значения
 * («0002-…», пустую строку при стирании), и писать их в CRM на каждый
 * символ значило затирать дату мусором. Пишем по уходу с поля, и только
 * если значение реально изменилось.
 */
export const PurchaseDateInput: FC<{ date: PurchaseDateView }> = ({ date }) => {
    const [draft, setDraft] = useState<string | null>(null);

    const commit = () => {
        if (draft !== null && draft !== '' && draft !== date.value) {
            date.setValue(draft);
        }
    };

    return (
        <div className={cn('space-y-1', date.wide && 'col-span-2')}>
            <Label className="text-xs text-muted-foreground">
                {date.label}
            </Label>
            <Input
                type="date"
                value={draft ?? date.value}
                onChange={event => setDraft(event.target.value)}
                onBlur={commit}
                className="h-7 text-xs"
            />
        </div>
    );
};
