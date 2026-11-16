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
import { KNOWLEDGE_BUDGET_TEXT } from '../../consts/knowledge-budget.texts';
import type {
    KnowledgeBudgetRowView,
    KnowledgeBudgetStatus,
} from '../../lib/knowledge-budget-view.util';

const T = KNOWLEDGE_BUDGET_TEXT;

const STATUS_TONE: Record<
    KnowledgeBudgetStatus,
    'muted' | 'success' | 'warning'
> = {
    empty: 'muted',
    fits: 'success',
    cut: 'warning',
    unread: 'warning',
};

/** Виды материалов портала: объём и что помещается в каждом месте чтения. */
export const KnowledgeBudgetTable = ({
    rows,
}: {
    rows: KnowledgeBudgetRowView[];
}) => (
    <div className="overflow-x-auto">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>{T.kind}</TableHead>
                    <TableHead>{T.volume}</TableHead>
                    <TableHead>{T.where}</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {rows.map((row) => (
                    <TableRow key={row.kind} className="align-top">
                        <TableCell className="min-w-56 space-y-1">
                            <p className="font-medium">{row.title}</p>
                            <p className="text-xs text-muted-foreground">
                                {row.kind}
                            </p>
                            <ToneBadge
                                tone={STATUS_TONE[row.status]}
                                variant="soft"
                                size="sm"
                            >
                                {row.statusLabel}
                            </ToneBadge>
                        </TableCell>
                        <TableCell className="min-w-44 space-y-1 text-sm">
                            <p className="tabular-nums">
                                {row.volume ?? (
                                    <span className="text-muted-foreground">
                                        {T.empty}
                                    </span>
                                )}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {row.documents}
                            </p>
                        </TableCell>
                        <TableCell className="min-w-80 space-y-2 text-sm">
                            {row.uses.map((use) => (
                                <div key={use.key}>
                                    <p
                                        className={
                                            use.off
                                                ? 'text-muted-foreground'
                                                : undefined
                                        }
                                    >
                                        {use.title}
                                        {use.off && ` — ${T.complianceOff}`}
                                    </p>
                                    <p
                                        className={
                                            use.cut
                                                ? 'text-xs tabular-nums text-warning'
                                                : 'text-xs tabular-nums text-muted-foreground'
                                        }
                                    >
                                        {use.line}
                                        {use.types && ` · ${use.types}`}
                                    </p>
                                </div>
                            ))}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </div>
);
