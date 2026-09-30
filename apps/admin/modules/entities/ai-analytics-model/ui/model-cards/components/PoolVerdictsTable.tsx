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
import { POOL_TEXT } from '../../../consts/ai-analytics-model.const';
import type { PoolVerdictRow } from '../../../lib/pool-view.util';
import { CodeLabel } from '../shared/CodeLabel';

/**
 * Вердикты по порталам пула — только обезличенные ключи (хэш), домены
 * наружу не отдаются. Свой портал помечен и стоит первым.
 */
export const PoolVerdictsTable = ({ verdicts }: { verdicts: PoolVerdictRow[] }) => (
    <div className="space-y-2">
        <h4 className="text-sm font-medium">{POOL_TEXT.verdictsTitle}</h4>
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{POOL_TEXT.key}</TableHead>
                        <TableHead>{POOL_TEXT.included}</TableHead>
                        <TableHead>{POOL_TEXT.reason}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {verdicts.map(row => (
                        <TableRow key={row.key}>
                            <TableCell className="whitespace-nowrap">
                                <code className="text-xs" title={row.key}>
                                    {row.shortKey}
                                </code>
                                {row.isSelf && (
                                    <ToneBadge tone="primary" variant="soft" size="sm" className="ml-2">
                                        {POOL_TEXT.self}
                                    </ToneBadge>
                                )}
                            </TableCell>
                            <TableCell>
                                <ToneBadge
                                    tone={row.included ? 'success' : 'muted'}
                                    variant="soft"
                                    size="sm"
                                >
                                    {row.included ? POOL_TEXT.yes : POOL_TEXT.no}
                                </ToneBadge>
                            </TableCell>
                            <TableCell>
                                <CodeLabel view={row.reason} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    </div>
);
