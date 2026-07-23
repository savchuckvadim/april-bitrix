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
import type { ReportData } from '@/modules/entities/report/model/types/report/report-type';
import type { StructureSection } from '@/modules/feature/report-tabs';
import { buildSectionRating, getRatingActions } from '../lib/rating.util';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
);

interface EntityRatingChartProps {
    /** «Победители — отделы» / «Победители — группы». */
    title: string;
    report: ReportData[];
    sections: StructureSection[];
}

/**
 * Рейтинг отделов/групп по выбранному показателю — тот же вид, что виджет
 * показателей по менеджерам (KPISingleActionChart), победители слева.
 */
export const EntityRatingChart: React.FC<EntityRatingChartProps> = ({
    title,
    report,
    sections,
}) => {
    const availableActions = useMemo(
        () => getRatingActions(report),
        [report],
    );

    const [selectedActionCode, setSelectedActionCode] = useState<string>('');
    const selectedAction =
        availableActions.find(a => a.innerCode === selectedActionCode) ||
        availableActions[0] ||
        null;

    const rating = useMemo(
        () =>
            selectedAction
                ? buildSectionRating(
                      report,
                      sections,
                      selectedAction.innerCode,
                  )
                : [],
        [report, sections, selectedAction],
    );

    const chartData = useMemo(() => {
        if (!selectedAction || !rating.length) {
            return { labels: [], datasets: [] };
        }
        const colors = getColors([{ action: selectedAction.action }]);
        const backgroundColor = colors[0] || 'rgba(30, 144, 255, 0.8)';

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

    if (!availableActions.length || sections.length < 2) {
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
                            value={selectedAction?.innerCode ?? ''}
                            onValueChange={setSelectedActionCode}
                        >
                            <SelectTrigger className="w-[250px]">
                                <SelectValue placeholder="Выберите действие" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableActions.map(action => (
                                    <SelectItem
                                        key={action.innerCode}
                                        value={action.innerCode}
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
