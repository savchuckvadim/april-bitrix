'use client';

import { useMemo } from 'react';
import { Chart } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    BarController,
    BarElement,
    CategoryScale,
    Legend,
    LineController,
    LineElement,
    LinearScale,
    PointElement,
    Title,
    Tooltip,
} from 'chart.js';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import { Label } from '@workspace/ui/components/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import {
    aiScoreRatingVolume,
    isAiRatingPreliminary,
    weightedAiScoreRating,
    type AiScoreRatingPoint,
} from '@/modules/entities/ai-analytics';
import type { StructureSection } from '@/modules/feature/report-tabs';
import { usePersistedSelection } from '@/modules/shared';
import {
    aiScoreChartData,
    aiScoreChartOptions,
    aiScoreChartTitle,
    isAiScoreRatingVisible,
    pickAiScoreIndicator,
} from '../../lib/ai-score-rating-chart.util';
import { AI_MATRIX_BLOCK_TEXT } from '../../lib/ai-matrix-texts';
import type { AiScoreIndicator } from '../../lib/ai-types-matrix-view.util';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarController,
    BarElement,
    LineController,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
);

interface AiScoreRatingChartProps {
    /** «отделы» / «группы» / «сотрудники» — в заголовок карточки. */
    entityLabel: string;
    points: AiScoreRatingPoint[];
    /** Корзины, типы звонков либо разделы рубрики (+ «Итог»). */
    indicators: AiScoreIndicator[];
    /** Среднее по отделу по коду показателя — линия на графике. */
    norms?: ReadonlyMap<string, number | null>;
    /** Секции отделов/групп; без них — рейтинг сотрудников. */
    sections?: StructureSection[];
    /** Ключ памяти выбранного показателя (localStorage). */
    storageKey: string;
}

/**
 * Средняя оценка по сущностям: оценки суммировать нельзя, поэтому вместо
 * EntityRatingChart — взвешенное по n среднее (weightedAiScoreRating).
 * Сущности без единой оценки опущены; одна сущность показывается, когда
 * есть линия среднего по отделу. При малом объёме разборов — подпись, что
 * порядок предварительный. Ось всегда 0..10.
 */
export const AiScoreRatingChart = ({
    entityLabel,
    points,
    indicators,
    norms,
    sections,
    storageKey,
}: AiScoreRatingChartProps) => {
    const [stored, setStored] = usePersistedSelection(storageKey);
    const indicator = pickAiScoreIndicator(indicators, stored);

    const rating = useMemo(
        () => (indicator ? weightedAiScoreRating(points, indicator.code, sections) : []),
        [points, indicator, sections],
    );
    const norm = indicator ? (norms?.get(indicator.code) ?? null) : null;

    if (!indicator || !isAiScoreRatingVisible(rating, norm)) return null;

    const chartTitle = aiScoreChartTitle(indicator);
    const preliminary =
        !sections && isAiRatingPreliminary(aiScoreRatingVolume(points, indicator.code));

    return (
        <Card className="mb-4">
            <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle>{AI_MATRIX_BLOCK_TEXT.rating.avgScore(entityLabel)}</CardTitle>
                    <div className="flex items-center gap-2">
                        <Label className="text-sm">Показатель:</Label>
                        <Select value={indicator.code} onValueChange={setStored}>
                            <SelectTrigger className="w-[250px]">
                                <SelectValue placeholder="Выберите показатель" />
                            </SelectTrigger>
                            <SelectContent>
                                {indicators.map(item => (
                                    <SelectItem key={item.code} value={item.code}>
                                        {item.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                {preliminary && (
                    <p className="text-xs text-muted-foreground">
                        {AI_MATRIX_BLOCK_TEXT.rating.preliminary}
                    </p>
                )}
            </CardHeader>
            <CardContent>
                <div style={{ height: '360px' }}>
                    <Chart<'bar' | 'line', (number | null)[], string>
                        type="bar"
                        data={aiScoreChartData(rating, chartTitle, norm)}
                        options={aiScoreChartOptions(chartTitle, norm !== null)}
                    />
                </div>
            </CardContent>
        </Card>
    );
};
