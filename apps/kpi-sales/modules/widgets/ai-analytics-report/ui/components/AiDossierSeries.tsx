'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import {
    AiMetricValue,
    formatAiPeriodKey,
    type AiDossierSeries as AiDossierSeriesData,
    type AiDossierSeriesPoint,
} from '@/modules/entities/ai-analytics';

interface AiDossierSeriesProps {
    series: AiDossierSeriesData;
}

/** Таблица точек ряда: период, разборов, средняя оценка (честно с n). */
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
                        <TableHead>Период</TableHead>
                        <TableHead className="text-right">Разборов</TableHead>
                        <TableHead>Оценка</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {points.map(point => (
                        <TableRow key={point.periodKey}>
                            <TableCell className="tabular-nums">
                                {formatAiPeriodKey(point.periodKey)}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                                {point.n}
                            </TableCell>
                            <TableCell>
                                <AiMetricValue
                                    metric={point.score}
                                    kind="score"
                                    withDetails
                                />
                            </TableCell>
                        </TableRow>
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
