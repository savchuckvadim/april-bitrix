'use client';

import { ToneBadge } from '@workspace/april-ui/badges';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import { BREAKDOWN_TEXT } from '../../../consts/ai-analytics-model.const';
import type { BreakdownRow } from '../../../lib/forecast-breakdown-view.util';

const T = BREAKDOWN_TEXT;
const NUM = 'text-right tabular-nums whitespace-nowrap';

/** Разложение прогноза по менеджерам: слагаемые, входы расчёта и сделки. */
export const BreakdownTable = ({ rows }: { rows: BreakdownRow[] }) => (
    <div className="overflow-x-auto">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>{T.manager}</TableHead>
                    <TableHead className="text-right">{T.p50Short}</TableHead>
                    <TableHead className="text-right">{T.done}</TableHead>
                    <TableHead className="text-right">{T.pipeline}</TableHead>
                    <TableHead className="text-right">{T.newFlow}</TableHead>
                    <TableHead className="text-right">{T.naive}</TableHead>
                    <TableHead className="text-right">{T.target}</TableHead>
                    <TableHead>{T.inputsTitle}</TableHead>
                    <TableHead>{T.dealsTitle}</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {rows.map(row => (
                    <TableRow key={row.managerId} className="align-top">
                        <TableCell className="whitespace-nowrap">
                            {row.managerId}
                        </TableCell>
                        <TableCell className={`${NUM} font-medium`}>
                            {row.p50}
                        </TableCell>
                        <TableCell className={NUM}>{row.done}</TableCell>
                        <TableCell className={NUM}>{row.pipeline}</TableCell>
                        <TableCell className={NUM}>{row.newFlow}</TableCell>
                        <TableCell className={NUM}>{row.naive}</TableCell>
                        <TableCell className={NUM}>{row.target}</TableCell>
                        <TableCell className="min-w-56 text-xs text-muted-foreground">
                            {row.inputs}
                        </TableCell>
                        <TableCell className="min-w-64 space-y-1 text-xs">
                            <p className="text-muted-foreground">
                                {T.openDeals(row.openDeals)}
                                {row.hasOldDeals && (
                                    <ToneBadge
                                        tone="warning"
                                        variant="soft"
                                        size="sm"
                                        className="ml-2"
                                        title={T.oldDealsHint}
                                    >
                                        {T.oldDeals}
                                    </ToneBadge>
                                )}
                            </p>
                            {row.deals.map(deal => (
                                <p key={deal}>{deal}</p>
                            ))}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </div>
);
