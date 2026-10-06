'use client';

import { FC } from 'react';
import { usePurchaseSignals } from '../lib/hooks/use-purchase-signals';
import { ConcurentsCard } from './ConcurentsCard';
import { ContractDatesCard } from './ContractDatesCard';

/**
 * Блок «когда клиент купит и кто его держит» — две карточки в полширины:
 * «Конкуренты» и «Покупка и договор» (владелец, 05.10.2026: одна карточка
 * на всю ширину смотрелась плохо). В узком фрейме встают друг под друга.
 *
 * Обязательны к ОЗНАКОМЛЕНИЮ, не к заполнению: блок стоит на виду и ничего
 * не блокирует. Карточки самогейтятся по слепку: не установлено ни одного
 * поля — карточки нет; нет обеих — нет и блока.
 */
export const PurchaseSignalsCard: FC = () => {
    const signals = usePurchaseSignals();

    if (!signals.hasConcurents && !signals.hasContract) return null;

    return (
        <div className="space-y-1">
            <div className="grid items-start gap-3 sm:grid-cols-2">
                {signals.hasConcurents && <ConcurentsCard signals={signals} />}
                {signals.hasContract && <ContractDatesCard signals={signals} />}
            </div>
            {signals.error && (
                <p className="text-xs text-destructive">{signals.error}</p>
            )}
        </div>
    );
};
