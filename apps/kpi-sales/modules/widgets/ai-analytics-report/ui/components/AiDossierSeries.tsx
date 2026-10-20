'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import { HintTooltip, ToneBadge } from '@workspace/april-ui';
import {
    AI_DOSSIER_SERIES_TEXT,
    AiMetricValue,
    aiDossierPointNotes,
    aiDossierThresholdHint,
    formatAiPeriodKey,
    type AiDossierSeries as AiDossierSeriesData,
    type AiDossierSeriesPoint,
    type AiHint,
} from '@/modules/entities/ai-analytics';

interface AiDossierSeriesProps {
    series: AiDossierSeriesData;
}

const T = AI_DOSSIER_SERIES_TEXT;
const HINT_TRIGGER = 'cursor-help border-b border-dashed border-muted-foreground/60';

/** Заголовок колонки с подсказкой. */
const Head = ({
    label,
    hint,
    className,
}: {
    label: string;
    hint: AiHint;
    className?: string;
}) => (
    <TableHead className={className}>
        <HintTooltip title={hint.title} lines={[...hint.lines]}>
            <span className={HINT_TRIGGER}>{label}</span>
        </HintTooltip>
    </TableHead>
);

/** Приглушённая пометка с подсказкой («оценено 6 из 7», «+3 до смены версии»). */
const Note = ({ text, hint }: { text: string; hint: AiHint }) => (
    <HintTooltip title={hint.title} lines={[...hint.lines]}>
        <span className={`text-[0.6875rem] text-muted-foreground ${HINT_TRIGGER}`}>
            {text}
        </span>
    </HintTooltip>
);

/** Строка точки ряда: период, разобрано с пометками, оценка (честно с порогом). */
const PointRow = ({ point }: { point: AiDossierSeriesPoint }) => {
    const notes = aiDossierPointNotes(point);
    return (
        <TableRow>
            <TableCell className="tabular-nums">
                {formatAiPeriodKey(point.periodKey)}
                {notes.versionsMixed && (
                    <div>
                        <HintTooltip
                            title={T.versionsMixed.hint.title}
                            lines={[...T.versionsMixed.hint.lines]}
                        >
                            <span>
                                <ToneBadge tone="warning" variant="soft" size="sm">
                                    {T.versionsMixed.label}
                                </ToneBadge>
                            </span>
                        </HintTooltip>
                    </div>
                )}
            </TableCell>
            <TableCell className="text-right tabular-nums">
                {point.n}
                {notes.beforeComparable && (
                    <div>
                        <Note
                            text={notes.beforeComparable}
                            hint={T.beforeComparableHint}
                        />
                    </div>
                )}
            </TableCell>
            <TableCell>
                <div className="flex flex-col items-start gap-0.5">
                    {notes.hiddenLabel ? (
                        <HintTooltip
                            title={aiDossierThresholdHint().title}
                            lines={[...aiDossierThresholdHint().lines]}
                        >
                            <span>
                                <ToneBadge tone="muted" variant="soft" size="sm">
                                    {notes.hiddenLabel}
                                </ToneBadge>
                            </span>
                        </HintTooltip>
                    ) : (
                        <AiMetricValue
                            metric={point.score}
                            kind="score"
                            withDetails
                        />
                    )}
                    {notes.scoredOf && (
                        <Note text={notes.scoredOf} hint={T.scoredOfHint} />
                    )}
                </div>
            </TableCell>
        </TableRow>
    );
};

/** Таблица точек ряда: период, разобрано, средняя оценка (честно с порогом). */
const PointsTable = ({
    title,
    points,
}: {
    title: string;
    points: AiDossierSeriesPoint[];
}) =>
    points.length ? (
        <div>
            <h5 className="mb-1 text-xs font-medium text-muted-foreground">
                {title}
            </h5>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{T.period}</TableHead>
                        <Head
                            label={T.analyzed.label}
                            hint={T.analyzed.hint}
                            className="text-right"
                        />
                        <Head label={T.score.label} hint={T.score.hint} />
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {points.map(point => (
                        <PointRow key={point.periodKey} point={point} />
                    ))}
                </TableBody>
            </Table>
        </div>
    ) : null;

/** Ряды досье: месяцы и недели окна по возрастанию с оценкой и объёмом. */
export const AiDossierSeries = ({ series }: AiDossierSeriesProps) => (
    <div className="grid gap-4 md:grid-cols-2">
        <PointsTable title="Месяцы" points={series.months} />
        <PointsTable title="Недели" points={series.weeks} />
    </div>
);
