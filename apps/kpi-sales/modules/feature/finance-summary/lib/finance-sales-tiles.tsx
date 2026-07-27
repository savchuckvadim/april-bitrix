import React from 'react';
import {
    Banknote,
    Boxes,
    CalendarClock,
    Handshake,
    TrendingUp,
    Wallet,
} from 'lucide-react';
import type { FinanceClosedTotals } from '@/modules/entities/finance';

export interface FinanceSalesTile {
    id: string;
    label: string;
    icon: React.ReactNode;
    money: boolean;
    /** Цвет акцента подписи — финансовый токен. */
    accent: string;
    value: (totals: FinanceClosedTotals) => number;
}

/**
 * Плитки «Продажи» (закрытые/выигранные сделки) — единый набор для
 * командного финанс-отчёта и user-report.
 */
export const FINANCE_SALES_TILES: FinanceSalesTile[] = [
    {
        id: 'dealsCount',
        label: 'Сделок',
        icon: <Handshake className="h-4 w-4" />,
        money: false,
        accent: 'text-muted-foreground',
        value: totals => totals.dealsCount,
    },
    {
        id: 'advanceAmount',
        label: 'Аванс (в кассе)',
        icon: <Wallet className="h-4 w-4" />,
        money: true,
        accent: 'text-finance-advance',
        value: totals => totals.advanceAmount,
    },
    {
        id: 'monthlyAmount',
        label: 'Месячная сумма',
        icon: <Banknote className="h-4 w-4" />,
        money: true,
        accent: 'text-finance-monthly',
        value: totals => totals.monthlyAmount,
    },
    {
        id: 'quantity',
        label: 'Кол-во товара',
        icon: <Boxes className="h-4 w-4" />,
        money: false,
        accent: 'text-finance-hot',
        value: totals => totals.quantity,
    },
    {
        id: 'paidMonths',
        label: 'Предопл. месяцев',
        icon: <CalendarClock className="h-4 w-4" />,
        money: false,
        accent: 'text-finance-hot',
        value: totals => totals.paidMonths,
    },
    {
        id: 'expectedContractAmount',
        label: 'Ожидаемая за договор',
        icon: <TrendingUp className="h-4 w-4" />,
        money: true,
        accent: 'text-finance-potential',
        value: totals => totals.expectedContractAmount,
    },
];
