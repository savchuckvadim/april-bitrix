'use client';

import React, { useMemo } from 'react';
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
import type { StructureSection } from '@/modules/feature/report-tabs';
import { usePersistedSelection } from '@/modules/shared';
import {
    buildSectionConversionRating,
    ConversionResult,
} from '@/modules/feature/report-conversions';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
);

interface ConversionSectionRatingChartProps {
    /** «Победители — отделы (конверсия)» / «— группы (конверсия)». */
    title: string;
    result: ConversionResult;
    sections: StructureSection[];
}

/**
 * Рейтинг секций (отделы/группы) по шагу конверсии. Отдельный компонент:
 * EntityRatingChart суммирует значения по секции, а проценты суммировать
 * нельзя — здесь секция агрегируется по числителям/знаменателям.
 */
export const ConversionSectionRatingChart: React.FC<
    ConversionSectionRatingChartProps
> = ({ title, result, sections }) => {
    const [selectedStep, setSelectedStep] = usePersistedSelection(
        `kpi-conversion-rating-${title}`,
    );
    const stepIndex = Math.max(
        0,
        result.stepDefs.findIndex(
            def => `${def.fromCode}->${def.toCode}` === selectedStep,
        ),
    );
    const currentDef = result.stepDefs[stepIndex];

    const rating = useMemo(
        () =>
            currentDef
                ? buildSectionConversionRating(result, sections, stepIndex)
                : [],
        [result, sections, stepIndex, currentDef],
    );

    if (!result.stepDefs.length || sections.length < 2) return null;

    const chartData = {
        labels: rating.map(row => row.name),
        datasets: [
            {
                label: '% конверсии',
                data: rating.map(row => row.value),
                backgroundColor: 'rgba(30, 144, 255, 0.8)',
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: {
                display: true,
                text: currentDef
                    ? `${currentDef.fromName} → ${currentDef.toName}, %`
                    : '',
            },
        },
        scales: { y: { beginAtZero: true } },
    };

    return (
        <Card className="mb-4">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>{title}</CardTitle>
                    <div className="flex items-center gap-2">
                        <Label className="text-sm">Шаг:</Label>
                        <Select
                            value={
                                currentDef
                                    ? `${currentDef.fromCode}->${currentDef.toCode}`
                                    : ''
                            }
                            onValueChange={setSelectedStep}
                        >
                            <SelectTrigger className="w-[280px]">
                                <SelectValue placeholder="Выберите шаг" />
                            </SelectTrigger>
                            <SelectContent>
                                {result.stepDefs.map(def => (
                                    <SelectItem
                                        key={`${def.fromCode}->${def.toCode}`}
                                        value={`${def.fromCode}->${def.toCode}`}
                                    >
                                        {def.fromName} → {def.toName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div style={{ height: '360px' }}>
                    <Bar data={chartData} options={options} />
                </div>
            </CardContent>
        </Card>
    );
};
