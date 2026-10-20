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
    AI_METRIC_THRESHOLDS,
    type AiMatrixTable,
} from '@/modules/entities/ai-analytics';
import { usePersistedSelection } from '@/modules/shared';
import {
    aiProfileChartData,
    aiProfileChartOptions,
    aiProfileChartTitle,
    aiProfileEntityOptions,
    buildAiProfileChart,
    resolveAiProfileEntity,
} from '../../lib/ai-matrix-profile-chart.util';
import { AI_MATRIX_BLOCK_TEXT } from '../../lib/ai-matrix-texts';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface AiMatrixProfileChartProps {
    matrix: AiMatrixTable;
    /** «корзинам звонков» / «типам звонков» / «разделам разговора». */
    columnsLabel: string;
    /** Ключ памяти выбранного сотрудника (localStorage). */
    storageKey: string;
}

/**
 * Профиль на «Сводном»: столбцы оценок выбранного сотрудника по колонкам
 * матрицы рядом со средним по отделу (вторая серия). По умолчанию — весь
 * выбранный состав (одно среднее); если сотрудник один — он. Показывается
 * и для одного сотрудника; ось 0..10.
 */
export const AiMatrixProfileChart = ({
    matrix,
    columnsLabel,
    storageKey,
}: AiMatrixProfileChartProps) => {
    const [stored, setStored] = usePersistedSelection(storageKey);
    const entity = resolveAiProfileEntity(stored, matrix);
    const options = useMemo(() => aiProfileEntityOptions(matrix), [matrix]);
    const chart = useMemo(() => buildAiProfileChart(matrix, entity), [matrix, entity]);

    if (!chart.labels.length) return null;

    return (
        <Card className="mb-4">
            <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle>{aiProfileChartTitle(chart, columnsLabel)}</CardTitle>
                    <div className="flex items-center gap-2">
                        <Label className="text-sm">
                            {AI_MATRIX_BLOCK_TEXT.chart.entityLabel}:
                        </Label>
                        <Select value={entity} onValueChange={setStored}>
                            <SelectTrigger className="w-[250px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {options.map(option => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {chart.hasScores ? (
                    <div style={{ height: '320px' }}>
                        <Bar
                            data={aiProfileChartData(chart)}
                            options={aiProfileChartOptions(chart)}
                        />
                    </div>
                ) : (
                    <p className="text-xs text-muted-foreground">
                        {AI_MATRIX_BLOCK_TEXT.chart.empty(AI_METRIC_THRESHOLDS.none)}
                    </p>
                )}
            </CardContent>
        </Card>
    );
};
