'use client';

import React, { memo } from 'react';
import { format } from 'date-fns';
import { TableCell, TableRow } from '@workspace/ui/components/table';
import { formatMoney, type FinanceClosedDeal } from '@/modules/entities/finance';
import { DealCompanyCell } from './DealCompanyCell';
import { DealContractCell } from './DealContractCell';

interface ClosedDealRowProps {
    deal: FinanceClosedDeal;
    domain: string;
}

const dealDate = (iso: string): string => {
    const date = new Date(iso);
    return Number.isNaN(date.getTime()) ? '—' : format(date, 'dd.MM.yyyy');
};

/** Строка закрытой сделки (мемо: сотни строк не перерисовываются зря). */
export const ClosedDealRow = memo<ClosedDealRowProps>(({ deal, domain }) => (
    <TableRow>
        <TableCell className="font-medium">
            <DealCompanyCell
                domain={domain}
                dealId={deal.id}
                dealTitle={deal.title}
                companyId={deal.companyId}
                companyName={deal.companyName}
                companyColor={deal.companyColor}
            />
        </TableCell>
        <TableCell>{dealDate(deal.closeDate)}</TableCell>
        <TableCell>
            <DealContractCell
                dealId={deal.id}
                contractTypeCode={deal.contractTypeCode}
                contractTypeName={deal.contractTypeName}
                contractStart={deal.contractStart}
                contractEnd={deal.contractEnd}
            />
        </TableCell>
        <TableCell className="text-right">
            {formatMoney(deal.advanceAmount)}
        </TableCell>
        <TableCell className="text-right">
            {formatMoney(deal.monthlyAmount)}
        </TableCell>
        <TableCell className="text-right">{deal.contractMonths}</TableCell>
        <TableCell className="text-right">
            {formatMoney(deal.expectedContractAmount)}
        </TableCell>
    </TableRow>
));
ClosedDealRow.displayName = 'ClosedDealRow';
