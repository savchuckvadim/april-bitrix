'use client';

import { HintTooltip } from '@workspace/april-ui';
import { TableCell, TableRow } from '@workspace/ui/components/table';
import { timeOfDateTime, type DigestSale } from '@/modules/entities/digest';
import { CrmClientLinks, CrmEntityLink } from '../../digest-section';
import { formatSaleMoney } from '../lib/sales-view.util';

interface SaleRowProps {
    sale: DigestSale;
    nameOf: (userId: number) => string;
    domain: string;
}

/** Продажа: сделка, сотрудник, клиент, комплект, сумма, её презентации. */
export const SaleRow = ({ sale, nameOf, domain }: SaleRowProps) => (
    <TableRow className="align-top text-xs">
        <TableCell>
            <HintTooltip title="История сделки" lines={sale.history.length ? sale.history : ['—']}>
                <span className="cursor-help font-medium">
                    <CrmEntityLink domain={domain} kind="deal" entity={{ id: sale.dealId, title: sale.title }} />
                </span>
            </HintTooltip>
        </TableCell>
        <TableCell className="font-medium">{nameOf(sale.assignedId)}</TableCell>
        <TableCell>
            <CrmClientLinks domain={domain} company={sale.company} contact={sale.contact} lead={sale.lead} />
        </TableCell>
        <TableCell>
            <div className="flex flex-col">
                <span>{sale.complectName ?? '—'}</span>
                {sale.productNames.length > 1 && (
                    <span className="text-muted-foreground">{sale.productNames.slice(1).join(', ')}</span>
                )}
            </div>
        </TableCell>
        <TableCell className="text-right font-semibold tabular-nums">{formatSaleMoney(sale.opportunity)}</TableCell>
        <TableCell>
            {!sale.presentations.length ? (
                <span className="text-muted-foreground">без презентации</span>
            ) : (
                <ul className="space-y-0.5">
                    {sale.presentations.map(pres => (
                        <li key={pres.dealId}>
                            <CrmEntityLink domain={domain} kind="deal" entity={{ id: pres.dealId, title: pres.title }} />
                            <span className="text-muted-foreground">
                                {' · '}
                                {pres.stageName ?? '—'}
                                {pres.doneDate && ` ${pres.doneDate.slice(8, 10)}.${pres.doneDate.slice(5, 7)} ${timeOfDateTime(pres.doneDate)}`}
                                {' · '}
                                {nameOf(pres.assignedId)}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </TableCell>
    </TableRow>
);
