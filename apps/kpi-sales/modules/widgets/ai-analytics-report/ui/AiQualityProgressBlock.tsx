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
import { ReportBlockWrapper } from '@/modules/entities/report';
import {
    AI_QUALITY_PROGRESS_TEXT,
    AiMetricValue,
    aiQualityProgressTone,
    formatAiProgress5,
    type AiQualityProgress,
    type AiQualityProgressCell,
    type AiQualityProgressQuadrantView,
} from '@/modules/entities/ai-analytics';
import { useAiSection } from '../hooks/use-ai-section';
import { AiManagerName } from './components/AiManagerName';
import { AiQueuedState } from './components/AiQueuedState';

const T = AI_QUALITY_PROGRESS_TEXT;

/** Колонки клеток в порядке бэка: ключ счётчика ↔ код клетки. */
const COUNT_KEYS = {
    strong: 'strong',
    quality_no_progress: 'qualityNoProgress',
    progress_no_quality: 'progressNoQuality',
    weak: 'weak',
} as const satisfies Record<string, keyof AiQualityProgressCell['counts']>;

const countOf = (cell: AiQualityProgressCell, code: string): number => {
    const key = (COUNT_KEYS as Record<string, keyof AiQualityProgressCell['counts']>)[code];
    return key ? cell.counts[key] : 0;
};

/** Клетка по средним бэйджем; мало данных — спокойная пометка. */
const PositionBadge = ({
    cell,
    quadrants,
}: {
    cell: AiQualityProgressCell;
    quadrants: AiQualityProgressQuadrantView[];
}) => {
    const quadrant = quadrants.find(item => item.code === cell.position);
    if (!cell.position || !quadrant) {
        return (
            <ToneBadge tone="muted" variant="soft" size="sm">
                {T.fewData}
            </ToneBadge>
        );
    }
    return (
        <HintTooltip title={quadrant.title} lines={[quadrant.hint, cell.explanation]}>
            <span>
                <ToneBadge tone={aiQualityProgressTone(cell.position)} variant="soft" size="sm">
                    {quadrant.title}
                </ToneBadge>
            </span>
        </HintTooltip>
    );
};

const CellCells = ({
    cell,
    quadrants,
}: {
    cell: AiQualityProgressCell;
    quadrants: AiQualityProgressQuadrantView[];
}) => (
    <>
        <TableCell className="text-right tabular-nums">{cell.n}</TableCell>
        <TableCell className="text-right">
            <AiMetricValue metric={cell.score} kind="score" size="sm" />
        </TableCell>
        <TableCell className="text-right tabular-nums">
            {cell.dealProgress.value === null ? T.fewData : formatAiProgress5(cell.dealProgress.value)}
        </TableCell>
        <TableCell>
            <PositionBadge cell={cell} quadrants={quadrants} />
        </TableCell>
        {quadrants.map(quadrant => (
            <TableCell key={quadrant.code} className="text-right tabular-nums">
                {countOf(cell, quadrant.code)}
            </TableCell>
        ))}
    </>
);

const QualityProgressTable = ({ block }: { block: AiQualityProgress }) => (
    <div className="space-y-2">
        <p className="text-xs text-muted-foreground">
            {T.thresholds(block.thresholds.qualityScoreMin, block.thresholds.progressMovingMin)}
        </p>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>{T.columns.manager}</TableHead>
                    <TableHead className="text-right">
                        <HintTooltip title={T.nHint.title} lines={[...T.nHint.lines]}>
                            <span className="cursor-help border-b border-dashed border-muted-foreground">
                                {T.columns.n}
                            </span>
                        </HintTooltip>
                    </TableHead>
                    <TableHead className="text-right">{T.columns.score}</TableHead>
                    <TableHead className="text-right">{T.columns.progress}</TableHead>
                    <TableHead>
                        <HintTooltip title={T.positionHint.title} lines={[...T.positionHint.lines]}>
                            <span className="cursor-help border-b border-dashed border-muted-foreground">
                                {T.columns.position}
                            </span>
                        </HintTooltip>
                    </TableHead>
                    {block.quadrants.map(quadrant => (
                        <TableHead key={quadrant.code} className="text-right">
                            <HintTooltip title={quadrant.title} lines={[quadrant.hint]}>
                                <span className="cursor-help border-b border-dashed border-muted-foreground">
                                    {quadrant.title}
                                </span>
                            </HintTooltip>
                        </TableHead>
                    ))}
                </TableRow>
            </TableHeader>
            <TableBody>
                {block.managers.map(manager => (
                    <TableRow key={manager.managerId}>
                        <TableCell>
                            <AiManagerName managerId={manager.managerId} tab="calls" />
                            {manager.progressNoQualityCallIds.length > 0 && (
                                <span className="block text-xs text-muted-foreground">
                                    {T.openCalls(manager.progressNoQualityCallIds.length)}
                                </span>
                            )}
                        </TableCell>
                        <CellCells cell={manager} quadrants={block.quadrants} />
                    </TableRow>
                ))}
                <TableRow className="font-medium">
                    <TableCell>{T.totals}</TableCell>
                    <CellCells cell={block.totals} quadrants={block.quadrants} />
                </TableRow>
            </TableBody>
        </Table>
    </div>
);

/**
 * Блок «AI: качество × продвижение» подвкладки «Качество звонков»: строки
 * менеджеров периметра и итог — звонков с продвижением, средняя оценка,
 * среднее продвижение, клетка по средним и число звонков в каждой клетке.
 * Данные приходят вместе с обзором (кэш обзора); старый кэш без блока и
 * период без разборов новой версии — пояснение вместо таблицы.
 */
export const AiQualityProgressBlock = () => {
    const overview = useAiSection('overview');
    const block = overview.data?.qualityProgress ?? null;

    return (
        <ReportBlockWrapper blockId="ai-quality-progress" title={T.title}>
            <p className="mb-2 text-xs text-muted-foreground">{T.description}</p>
            <AiQueuedState
                status={overview.status}
                jobStatus={overview.jobStatus}
                error={overview.error}
                loadingText={T.loading}
                skeletonRows={4}
                onRetry={overview.retry}
            />
            {overview.status === 'ready' &&
                (block ? (
                    <QualityProgressTable block={block} />
                ) : (
                    <p className="py-2 text-xs text-muted-foreground">{T.empty}</p>
                ))}
        </ReportBlockWrapper>
    );
};
