'use client';

import { TONE_TEXT } from '@workspace/april-ui/tones';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import { cn } from '@workspace/ui/lib/utils';
import { EFFECT_TEXT } from '../../../consts/ai-analytics-model.const';
import type {
    EffectEdgeRow,
    EffectLeverRow,
} from '../../../lib/recommendation-effect-view.util';
import { CodeLabel } from '../shared/CodeLabel';

const NUM = 'text-right tabular-nums whitespace-nowrap';

const Empty = ({ text }: { text: string }) => (
    <p className="text-sm text-muted-foreground">{text}</p>
);

/** Свод по направлениям советов: выдано, окно закрыто, выполнено, несогласия. */
export const EffectLeversTable = ({ levers }: { levers: EffectLeverRow[] }) => (
    <div className="space-y-2">
        <h4 className="text-sm font-medium">{EFFECT_TEXT.leversTitle}</h4>
        {levers.length === 0 ? (
            <Empty text={EFFECT_TEXT.noLevers} />
        ) : (
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{EFFECT_TEXT.lever}</TableHead>
                            <TableHead className="text-right">{EFFECT_TEXT.issued}</TableHead>
                            <TableHead className="text-right">{EFFECT_TEXT.completed}</TableHead>
                            <TableHead className="text-right">{EFFECT_TEXT.done}</TableHead>
                            <TableHead className="text-right">{EFFECT_TEXT.disagree}</TableHead>
                            <TableHead className="text-right">{EFFECT_TEXT.doneShare}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {levers.map(row => (
                            <TableRow key={row.lever.code}>
                                <TableCell>
                                    <CodeLabel view={row.lever} />
                                </TableCell>
                                <TableCell className={NUM}>{row.issued}</TableCell>
                                <TableCell className={NUM}>{row.completed}</TableCell>
                                <TableCell className={NUM}>{row.done}</TableCell>
                                <TableCell className={NUM}>{row.disagree}</TableCell>
                                <TableCell className={NUM}>{row.doneShare}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        )}
    </div>
);

/** До и после выдачи по шагам воронки; разность подсвечена по интервалу. */
export const EffectEdgesTable = ({ edges }: { edges: EffectEdgeRow[] }) => (
    <div className="space-y-2">
        <h4 className="text-sm font-medium">{EFFECT_TEXT.edgesTitle}</h4>
        {edges.length === 0 ? (
            <Empty text={EFFECT_TEXT.noEdges} />
        ) : (
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{EFFECT_TEXT.edge}</TableHead>
                            <TableHead className="text-right">{EFFECT_TEXT.before}</TableHead>
                            <TableHead className="text-right">{EFFECT_TEXT.after}</TableHead>
                            <TableHead className="text-right">{EFFECT_TEXT.diff}</TableHead>
                            <TableHead className="text-right" title={EFFECT_TEXT.windowsHint}>
                                {EFFECT_TEXT.windows}
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {edges.map(row => (
                            <TableRow key={row.edge.code}>
                                <TableCell>
                                    <CodeLabel view={row.edge} />
                                </TableCell>
                                <TableCell className={NUM}>{row.before}</TableCell>
                                <TableCell className={NUM}>{row.after}</TableCell>
                                <TableCell className={cn(NUM, TONE_TEXT[row.tone])}>
                                    {row.diff}
                                </TableCell>
                                <TableCell className={NUM}>{row.windows}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        )}
    </div>
);
