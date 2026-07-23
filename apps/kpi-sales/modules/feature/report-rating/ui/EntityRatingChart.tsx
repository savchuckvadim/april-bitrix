'use client';

import React, { useMemo, useState } from 'react';
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
import { getColors } from '@/modules/entities/report/lib/colors';
import type { StructureSection } from '@/modules/feature/report-tabs';
import {
    buildSectionRating,
    buildUserRating,
    RatingDataset,
} from '../lib/rating.util';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
);

interface EntityRatingChartProps {
    /** «Победители — отделы» / «— группы» / «— сотрудники». */
    title: string;
    dataset: RatingDataset;
    /** Секции отделов/групп; без них — рейтинг сотрудников. */
    sections?: StructureSection[];
}

/**
 * Рейтинг-победители по выбранному показателю — тот же вид, что виджет
 * показателей по менеджерам. Работает поверх RatingDataset, поэтому
 * одинаково подходит событиям, звонкам и объединённому отчёту.
 */
export const EntityRatingChart: React.FC<EntityRatingChartProps> = ({
    title,
    dataset,
    sections,
}) => {
    const [selectedActionCode, setSelectedActionCode] = useState<string>('');
    const selectedAction =
        dataset.actions.find(a => a.code === selectedActionCode) ||
        dataset.actions[0] ||
        null;

    const rating = useMemo(() => {
        if (!selectedAction) return [];
        return sections
            ? buildSectionRating(dataset, sections, selectedAction.code)
            : buildUserRating(dataset, selectedAction.code);
    }, [dataset, sections, selectedAction]);

    const chartData = useMemo(() => {
        if (!selectedAction || !rating.length) {
            return { labels: [], datasets: [] };
        }
        const backgroundColor = selectedAction.filterAction
            ? getColors([{ action: selectedAction.filterAction }])[0] ||
              'rgba(30, 144, 255, 0.8)'
            : 'rgba(30, 144, 255, 0.8)';

        return {
            labels: rating.map(row => row.name),
            datasets: [
                {
                    label: selectedAction.name,
                    data: rating.map(row => row.value),
                    backgroundColor,
                    borderWidth: 1,
                },
            ],
        };
    }, [rating, selectedAction]);

    const entityCount = sections ? sections.length : dataset.rows.length;
    if (!dataset.actions.length || entityCount < 2) {
        return null;
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: {
                display: true,
                text: selectedAction?.name || 'Выберите действие',
            },
        },
        scales: {
            y: { beginAtZero: true },
        },
    };

    return (
        <Card className="mb-4">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>{title}</CardTitle>
                    <div className="flex items-center gap-2">
                        <Label className="text-sm">Действие:</Label>
                        <Select
                            value={selectedAction?.code ?? ''}
                            onValueChange={setSelectedActionCode}
                        >
                            <SelectTrigger className="w-[250px]">
                                <SelectValue placeholder="Выберите действие" />
                            </SelectTrigger>
                            <SelectContent>
                                {dataset.actions.map(action => (
                                    <SelectItem
                                        key={action.code}
                                        value={action.code}
                                    >
                                        {action.name}
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
