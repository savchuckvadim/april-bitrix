'use client';

import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import type { AiDealMovementDeal } from '@/modules/entities/ai-analytics';
import type { AiDmNameOf } from '../../hooks/use-ai-dm-name';
import { AI_DEAL_MOVEMENT_TEXT } from '../../lib/deal-movement/ai-deal-movement.texts';
import { AiDmDealRow } from './AiDmDealRow';

const C = AI_DEAL_MOVEMENT_TEXT.deals.columns;

interface AiDmDealsTableProps {
    items: readonly AiDealMovementDeal[];
    nameOf: AiDmNameOf;
    /** Список одного менеджера — имя под названием сделки не повторяем. */
    oneManager: boolean;
}

/** Таблица проблемных сделок страницы (порядок — сервера, крупные первыми). */
export const AiDmDealsTable = ({ items, nameOf, oneManager }: AiDmDealsTableProps) => (
    <Table>
        <TableHeader>
            <TableRow>
                <TableHead>{C.deal}</TableHead>
                <TableHead>{C.status}</TableHead>
                <TableHead className="text-right">{C.amount}</TableHead>
                <TableHead>{C.stage}</TableHead>
                <TableHead>{C.reasons}</TableHead>
                <TableHead>{C.since}</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {items.map(deal => (
                <AiDmDealRow
                    key={deal.dealId}
                    deal={deal}
                    managerName={
                        oneManager ? null : nameOf(deal.managerId, deal.managerName)
                    }
                />
            ))}
        </TableBody>
    </Table>
);
