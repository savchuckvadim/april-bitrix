'use client';

import { Info } from 'lucide-react';
import { HintTooltip } from '@workspace/april-ui';
import { ToneBadge } from '@workspace/april-ui/badges';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import { BACKTEST_TEXT, MODEL_TEXT } from '../../../consts/ai-analytics-model.const';
import type { BacktestRow } from '../../../lib/forecast-backtest-view.util';
import { CodeLabel } from '../shared/CodeLabel';

const NUM = 'text-right tabular-nums whitespace-nowrap';

/** Заголовок столбца отношения ошибок с общей подсказкой. */
const RatioHead = ({ label }: { label: string }) => (
    <TableHead className="text-right">
        <span className="inline-flex items-center gap-1">
            {label}
            <HintTooltip title={label} lines={[BACKTEST_TEXT.ratioHint]}>
                <button type="button" aria-label={BACKTEST_TEXT.ratioHint}>
                    <Info className="size-3.5 text-muted-foreground/70" />
                </button>
            </HintTooltip>
        </span>
    </TableHead>
);

/** Проверки точности прогноза по закрытым месяцам, свежие первыми. */
export const BacktestTable = ({ rows }: { rows: BacktestRow[] }) => (
    <div className="overflow-x-auto">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>{MODEL_TEXT.month}</TableHead>
                    <TableHead>{BACKTEST_TEXT.status}</TableHead>
                    <TableHead className="text-right">{BACKTEST_TEXT.coverage}</TableHead>
                    <TableHead className="text-right">{BACKTEST_TEXT.coverageTarget}</TableHead>
                    <RatioHead label={BACKTEST_TEXT.maseNaive} />
                    <RatioHead label={BACKTEST_TEXT.maseMean3} />
                    <TableHead className="text-right">{BACKTEST_TEXT.maseMax}</TableHead>
                    <TableHead className="text-right">{BACKTEST_TEXT.shadow}</TableHead>
                    <TableHead>{BACKTEST_TEXT.volume}</TableHead>
                    <TableHead>{MODEL_TEXT.reasons}</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {rows.map(row => (
                    <TableRow key={row.key}>
                        <TableCell className="whitespace-nowrap" title={row.generatedAt}>
                            {row.month}
                        </TableCell>
                        <TableCell>
                            <ToneBadge tone={row.status.tone} variant="soft" size="sm">
                                {row.status.label}
                            </ToneBadge>
                        </TableCell>
                        <TableCell className={NUM}>{row.coverage}</TableCell>
                        <TableCell className={NUM}>{row.coverageTarget}</TableCell>
                        <TableCell className={NUM}>{row.maseNaive}</TableCell>
                        <TableCell className={NUM}>{row.maseMean3}</TableCell>
                        <TableCell className={NUM}>{row.maseMax}</TableCell>
                        <TableCell className={NUM}>{row.shadow}</TableCell>
                        <TableCell className="whitespace-nowrap">{row.volume}</TableCell>
                        <TableCell className="min-w-56 text-xs">
                            {row.reasons.length === 0
                                ? MODEL_TEXT.noReasons
                                : row.reasons.map(reason => (
                                      <div key={reason.code}>
                                          <CodeLabel view={reason} />
                                      </div>
                                  ))}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </div>
);
