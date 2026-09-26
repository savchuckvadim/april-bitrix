'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import { ToneBadge } from '@workspace/april-ui';
import {
    AI_YOY_METRIC,
    aiYoyReasonLabel,
    aiYoyTone,
    formatAiYoyDelta,
    formatAiYoyValue,
    type AiYoy,
} from '@/modules/entities/ai-analytics';

interface AiDossierYoyProps {
    yoy: AiYoy;
}

/**
 * «Год назад»: величины месяца окончания окна против того же месяца
 * годом ранее — описательно, с оговорками сопоставимости (сменился отдел,
 * уровень, версии разбора). «Лучше/хуже» блок не говорит.
 */
export const AiDossierYoy = ({ yoy }: AiDossierYoyProps) => (
    <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>
                {yoy.periodKey} против {yoy.basePeriodKey}
            </span>
            <ToneBadge tone={aiYoyTone(yoy)} variant="soft" size="sm">
                {yoy.comparable ? 'сопоставимо' : 'с оговорками'}
            </ToneBadge>
        </div>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Величина</TableHead>
                    <TableHead className="text-right">Сейчас</TableHead>
                    <TableHead className="text-right">Год назад</TableHead>
                    <TableHead className="text-right">Разница</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {yoy.metrics.map(metric => (
                    <TableRow key={metric.metric}>
                        <TableCell>{AI_YOY_METRIC[metric.metric].label}</TableCell>
                        <TableCell className="text-right tabular-nums">
                            {formatAiYoyValue(metric, metric.current.value)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                            {formatAiYoyValue(metric, metric.base.value)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                            {formatAiYoyDelta(metric)}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
        {!yoy.comparable && yoy.reasons.length > 0 && (
            <ul className="list-disc space-y-0.5 pl-5 text-xs text-muted-foreground">
                {yoy.reasons.map(code => (
                    <li key={code}>{aiYoyReasonLabel(code)}</li>
                ))}
            </ul>
        )}
    </div>
);
