'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import type { AiAboutEstimate } from '@/modules/entities/ai-analytics';
import {
    AI_ABOUT_ESTIMATE_SOURCE_LABELS,
    formatAiAboutEstimateValue,
} from '../../lib/ai-about.util';

interface AiHowWeCountEstimatesProps {
    estimates: AiAboutEstimate[];
}

/** κ / φ / λ модели портала: символ, подпись, значение, источник, пояснение. */
export const AiHowWeCountEstimates = ({
    estimates,
}: AiHowWeCountEstimatesProps) => (
    <Table>
        <TableHeader>
            <TableRow>
                <TableHead className="w-12">Символ</TableHead>
                <TableHead>Величина</TableHead>
                <TableHead className="text-right">Значение</TableHead>
                <TableHead>Источник</TableHead>
                <TableHead>Пояснение</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {estimates.map(estimate => (
                <TableRow key={estimate.code}>
                    <TableCell className="align-top text-base">
                        {estimate.symbol}
                    </TableCell>
                    <TableCell className="align-top">
                        <div>{estimate.title}</div>
                        <code className="text-[0.6875rem] text-muted-foreground">
                            {estimate.code}
                        </code>
                    </TableCell>
                    <TableCell className="text-right align-top font-medium tabular-nums">
                        {formatAiAboutEstimateValue(estimate.value)}
                    </TableCell>
                    <TableCell className="align-top text-muted-foreground">
                        {AI_ABOUT_ESTIMATE_SOURCE_LABELS[estimate.source]}
                    </TableCell>
                    <TableCell className="align-top whitespace-normal text-muted-foreground">
                        {estimate.note}
                    </TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
);
