'use client';

import { HintTooltip, ToneBadge } from '@workspace/april-ui';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import type { AiAboutParam } from '@/modules/entities/ai-analytics';
import {
    AI_ABOUT_BREAKS_SERIES_LABEL,
    AI_ABOUT_KIND,
    AI_ABOUT_LAYER_LABELS,
    AI_ABOUT_REASON_LABELS,
    formatAiAboutParamValue,
} from '../../lib/ai-about.util';

interface AiHowWeCountParamRowProps {
    param: AiAboutParam;
}

/** Параметр реестра: название и код, значение с единицей, слой, класс, описание. */
const AiHowWeCountParamRow = ({ param }: AiHowWeCountParamRowProps) => {
    const kind = AI_ABOUT_KIND[param.kind];

    return (
        <TableRow>
            <TableCell className="align-top">
                <div className="font-medium">{param.title}</div>
                <code className="text-[0.6875rem] text-muted-foreground">
                    {param.code}
                </code>
            </TableCell>
            <TableCell className="whitespace-nowrap align-top font-medium tabular-nums">
                {formatAiAboutParamValue(param.value, param.unit)}
            </TableCell>
            <TableCell className="align-top text-muted-foreground">
                {AI_ABOUT_LAYER_LABELS[param.layer]}
            </TableCell>
            <TableCell className="align-top">
                <ToneBadge tone={kind.tone} variant="soft" size="sm">
                    {kind.label}
                </ToneBadge>
            </TableCell>
            <TableCell className="align-top whitespace-normal text-muted-foreground">
                <p>{param.description}</p>
                {param.reason && (
                    <p className="mt-1 text-xs text-warning">
                        {AI_ABOUT_REASON_LABELS[param.reason]}
                    </p>
                )}
                {param.breaksSeries && (
                    <HintTooltip
                        title={AI_ABOUT_BREAKS_SERIES_LABEL}
                        lines={[
                            'Смена значения сдвигает начало сравнимой истории — ряды до и после менять местами нельзя.',
                        ]}
                    >
                        <span className="mt-1 inline-block">
                            <ToneBadge
                                tone="warning"
                                variant="outline"
                                size="sm"
                            >
                                {AI_ABOUT_BREAKS_SERIES_LABEL}
                            </ToneBadge>
                        </span>
                    </HintTooltip>
                )}
            </TableCell>
        </TableRow>
    );
};

interface AiHowWeCountParamsProps {
    params: AiAboutParam[];
}

/** Параметры реестра, которые использует ручка, с действующими значениями. */
export const AiHowWeCountParams = ({ params }: AiHowWeCountParamsProps) => (
    <section className="space-y-2">
        <h4 className="text-sm font-medium">
            Параметры расчёта
            <span className="ml-2 text-xs font-normal text-muted-foreground">
                {params.length}
            </span>
        </h4>
        {params.length ? (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Параметр</TableHead>
                        <TableHead>Значение</TableHead>
                        <TableHead>Слой</TableHead>
                        <TableHead>Класс</TableHead>
                        <TableHead>Описание</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {params.map(param => (
                        <AiHowWeCountParamRow key={param.code} param={param} />
                    ))}
                </TableBody>
            </Table>
        ) : (
            <p className="text-xs text-muted-foreground">
                Параметров реестра ручка не использует.
            </p>
        )}
    </section>
);
