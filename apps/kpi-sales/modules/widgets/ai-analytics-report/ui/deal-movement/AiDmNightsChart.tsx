'use client';

import { useMemo, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LineElement,
    LinearScale,
    PointElement,
    Tooltip,
} from 'chart.js';
import { MicroSegmented } from '@workspace/april-ui';
import type {
    AiDealMovementNight,
    AiDealMovementStatus,
} from '@/modules/entities/ai-analytics';
import { AI_DEAL_MOVEMENT_TEXT } from '../../lib/deal-movement/ai-deal-movement.texts';
import {
    AI_DM_CHART_MIN_NIGHTS,
    aiDmChartData,
    aiDmChartOptions,
    aiDmNightsChart,
    isAiDmChartMetric,
    type AiDmChartMetric,
} from '../../lib/deal-movement/ai-deal-movement-chart.util';
import { aiDmStatusColor } from '../../lib/deal-movement/ai-deal-movement-colors';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const T = AI_DEAL_MOVEMENT_TEXT.statuses;

const METRIC_OPTIONS = [
    { value: 'count', label: T.metric.count },
    { value: 'amount', label: T.metric.amount },
];

interface AiDmNightsChartProps {
    nights: readonly AiDealMovementNight[];
    titles: ReadonlyMap<AiDealMovementStatus, string>;
}

/**
 * Динамика статусов отдела по ночам периода: линия на статус, число
 * сделок или сумма. Меньше двух ночей — пояснение вместо графика.
 */
export const AiDmNightsChart = ({ nights, titles }: AiDmNightsChartProps) => {
    const [metric, setMetric] = useState<AiDmChartMetric>('count');
    const model = useMemo(
        () => aiDmNightsChart(nights, metric, titles),
        [nights, metric, titles],
    );

    if (nights.length < AI_DM_CHART_MIN_NIGHTS) {
        return <p className="text-xs text-muted-foreground">{T.dynamicsFew}</p>;
    }

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-medium">{T.dynamicsTitle}</h3>
                <MicroSegmented
                    ariaLabel={T.metricAria}
                    options={METRIC_OPTIONS}
                    value={metric}
                    onChange={value => isAiDmChartMetric(value) && setMetric(value)}
                    size="xs"
                />
            </div>
            {model.hasValues ? (
                <div className="h-72">
                    <Line
                        data={aiDmChartData(model, aiDmStatusColor)}
                        options={aiDmChartOptions(metric)}
                    />
                </div>
            ) : (
                <p className="text-xs text-muted-foreground">
                    {metric === 'amount' ? T.noAmounts : T.dynamicsFew}
                </p>
            )}
        </div>
    );
};
