'use client';

import React, { memo } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { TableCell, TableRow } from '@workspace/ui/components/table';
import { Badge } from '@workspace/ui/components/badge';
import { cn } from '@workspace/ui/lib/utils';
import {
    financeEmployeeName,
    formatMoney,
    type FinanceHotDeal,
} from '@/modules/entities/finance';
import type { BXUser } from '@workspace/bx';
import { dealStageBadgeClass } from '../../lib/deal-stage-colors';
import { DealCompanyCell } from './DealCompanyCell';
import { DealContractCell } from './DealContractCell';
import { HotClientDetailsRow } from './HotClientDetailsRow';

interface HotClientRowProps {
    deal: FinanceHotDeal;
    domain: string;
    departmentItems: BXUser[];
    hideManager: boolean;
    columnsCount: number;
    isOpen: boolean;
    onToggle: (id: number) => void;
}

/**
 * Строка горячей сделки (+ раскрытая детализация). React.memo: на сотнях
 * сделок ререндер таблицы не перерисовывает неизменённые строки
 * (тоггл раскрытия одной строки не трогает остальные).
 */
export const HotClientRow = memo<HotClientRowProps>(
    ({
        deal,
        domain,
        departmentItems,
        hideManager,
        columnsCount,
        isOpen,
        onToggle,
    }) => (
        <>
            <TableRow
                className="cursor-pointer"
                onClick={() => onToggle(deal.id)}
            >
                {/* Компания: имя-ссылка на сделку (история — раскрытие
                    строки), иконка → карточка компании, точка-перспектива */}
                <TableCell className="font-medium">
                    <DealCompanyCell
                        domain={domain}
                        dealId={deal.id}
                        dealTitle={deal.title}
                        companyId={deal.companyId}
                        companyName={deal.companyName}
                        companyColor={deal.companyColor}
                        leading={
                            isOpen ? (
                                <ChevronDown className="h-4 w-4 shrink-0" />
                            ) : (
                                <ChevronRight className="h-4 w-4 shrink-0" />
                            )
                        }
                    />
                </TableCell>
                {!hideManager && (
                    <TableCell>
                        {financeEmployeeName(departmentItems, deal.assignedId)}
                    </TableCell>
                )}
                <TableCell>
                    <Badge
                        variant="outline"
                        className={cn(dealStageBadgeClass(deal.stageCode))}
                    >
                        {deal.stageName || deal.stageCode}
                    </Badge>
                </TableCell>
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
                    {formatMoney(deal.opportunity)}
                </TableCell>
                <TableCell className="text-right font-medium">
                    {formatMoney(deal.monthlyAmount)}
                </TableCell>
            </TableRow>
            {isOpen && (
                <TableRow>
                    <TableCell colSpan={columnsCount} className="p-2">
                        <HotClientDetailsRow
                            opHistory={deal.opHistory}
                            opMHistory={deal.opMHistory ?? []}
                            comments={deal.comments}
                            companyId={deal.companyId}
                            companyClientType={deal.companyClientType}
                        />
                    </TableCell>
                </TableRow>
            )}
        </>
    ),
);
HotClientRow.displayName = 'HotClientRow';
