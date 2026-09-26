'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import { ToneBadge } from '@workspace/april-ui/badges';
import { GOLDEN_SET_TEXT } from '../../../consts/ai-analytics-audit.const';
import type { GoldenSetEntryView } from '../../../lib/golden-set.util';

interface GoldenSetTableProps {
    entries: GoldenSetEntryView[];
    /** Записей ais с чужой формой нагрузки — пропущены сервисом. */
    skipped: number;
}

/**
 * Состав отчётов согласия: по одному на версию промпта (прежний по той же
 * версии помечен superseded и в набор не входит). Пусто — подсказка
 * запустить прогон.
 */
export const GoldenSetTable = ({ entries, skipped }: GoldenSetTableProps) => (
    <div className="space-y-2">
        <h4 className="text-sm font-medium">{GOLDEN_SET_TEXT.entriesTitle}</h4>
        {entries.length === 0 ? (
            <p className="text-sm text-muted-foreground">
                {GOLDEN_SET_TEXT.empty}
            </p>
        ) : (
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{GOLDEN_SET_TEXT.promptVersion}</TableHead>
                            <TableHead>{GOLDEN_SET_TEXT.periodKey}</TableHead>
                            <TableHead className="text-right">
                                {GOLDEN_SET_TEXT.pairs}
                            </TableHead>
                            <TableHead className="text-right">
                                {GOLDEN_SET_TEXT.sigmaLlm}
                            </TableHead>
                            <TableHead>{GOLDEN_SET_TEXT.generatedAt}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {entries.map(entry => (
                            <TableRow key={entry.id}>
                                <TableCell>
                                    <code className="text-xs">
                                        {entry.promptVersion}
                                    </code>
                                </TableCell>
                                <TableCell className="font-mono text-xs">
                                    {entry.periodKey}
                                </TableCell>
                                <TableCell className="text-right tabular-nums">
                                    {entry.pairs}{' '}
                                    <ToneBadge
                                        tone={entry.quota.tone}
                                        variant="soft"
                                        size="sm"
                                    >
                                        {entry.quota.label}
                                    </ToneBadge>
                                </TableCell>
                                <TableCell className="text-right tabular-nums">
                                    {entry.sigmaLlm}{' '}
                                    <ToneBadge
                                        tone={entry.sigmaSource.tone}
                                        variant="soft"
                                        size="sm"
                                    >
                                        {entry.sigmaSource.label}
                                    </ToneBadge>
                                </TableCell>
                                <TableCell className="tabular-nums">
                                    {entry.generatedAt}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        )}
        {skipped > 0 && (
            <p className="text-xs text-muted-foreground">
                {GOLDEN_SET_TEXT.skipped}: {skipped}
            </p>
        )}
    </div>
);
