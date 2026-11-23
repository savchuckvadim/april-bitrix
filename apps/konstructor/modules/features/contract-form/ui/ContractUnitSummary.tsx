'use client';

import type { ContractUnitSummary as ContractUnitSummaryData } from '@/modules/entities/contract-document';

export interface ContractUnitSummaryProps {
    summary: ContractUnitSummaryData;
}

/** Шапка карточки договора варианта: комплект, поставка и вид договора главной строки. */
export const ContractUnitSummary = ({ summary }: ContractUnitSummaryProps) => (
    <dl className="grid gap-2 text-sm sm:grid-cols-3">
        <div className="flex flex-col">
            <dt className="text-xs text-muted-foreground">Комплект</dt>
            <dd className="font-medium">{summary.complect}</dd>
        </div>
        <div className="flex flex-col">
            <dt className="text-xs text-muted-foreground">Поставка</dt>
            <dd className="font-medium">{summary.supply}</dd>
        </div>
        <div className="flex flex-col">
            <dt className="text-xs text-muted-foreground">Вид договора</dt>
            <dd className="font-medium">{summary.contract}</dd>
        </div>
    </dl>
);
