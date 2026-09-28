'use client';

import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
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
import type { AiScoreIndicator } from '../../lib/ai-types-matrix-view.util';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
);

interface AiScoreRatingChartProps {
    /** «Оценка — отделы» / «— группы» / «— сотрудники». */
    title: string;
    points: AiScoreRatingPoint[];
    /** Типы звонков либо разделы рубрики (+ «Все разборы»). */
    indicators: AiScoreIndicator[];
    /** Секции отделов/групп; без них — рейтинг сотрудников. */
    sections?: StructureSection[];
    /** Ключ памяти выбранного показателя (localStorage). */
    storageKey: string;
}

/**
 * Рейтинг по оценке разборов: оценки суммировать нельзя, поэтому вместо
 * EntityRatingChart — взвешенное по n среднее Σ(score·n)/Σn по сущности
 * (weightedAiScoreRating). Сущности без единой оценки опущены; меньше
 * двух сущностей с оценкой — график не показываем. Ось всегда 0..10.
 */
export const AiScoreRatingChart = ({
    title,
    points,
    indicators,
    sections,
    storageKey,
}: AiScoreRatingChartProps) => {
    const [stored, setStored] = usePersistedSelection(storageKey);
    const indicator = pickAiScoreIndicator(indicators, stored);

    const rating = useMemo(
        () =>
            indicator
                ? weightedAiScoreRating(points, indicator.code, sections)
                : [],
        [points, indicator, sections],
    );

    if (!indicator || !isAiScoreRatingVisible(rating)) return null;

    const chartTitle = aiScoreChartTitle(indicator);

    return (
        <Card className="mb-4">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>{title}</CardTitle>
                    <div className="flex items-center gap-2">
                        <Label className="text-sm">Показатель:</Label>
                        <Select
                            value={indicator.code}
                            onValueChange={setStored}
                        >
                            <SelectTrigger className="w-[250px]">
                                <SelectValue placeholder="Выберите показатель" />
                            </SelectTrigger>
                            <SelectContent>
                                {indicators.map(item => (
                                    <SelectItem
                                        key={item.code}
                                        value={item.code}
                                    >
                                        {item.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div style={{ height: '360px' }}>
                    <Bar
                        data={aiScoreChartData(rating, chartTitle)}
                        options={aiScoreChartOptions(chartTitle)}
                    />
                </div>
            </CardContent>
        </Card>
    );
};
