'use client'
import React, { useState, useMemo } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Label } from '@workspace/ui/components/label';
import { ReportData } from '../../model/types/report/report-type';
import { getColors } from '../../lib/colors';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
);

interface KPISingleActionChartProps {
    report: ReportData[];
}

export const KPISingleActionChart: React.FC<KPISingleActionChartProps> = ({
    report,
}) => {
    // Получаем все доступные действия из первого отчета
    const availableActions = useMemo(() => {
        if (!report || report.length === 0 || !report[0]?.kpi) {
            return [];
        }
        return report[0].kpi.map(kpi => ({
            innerCode: kpi.action.innerCode,
            name: kpi.action.name || 'Unknown',
            action: kpi.action,
        }));
    }, [report]);

    // Выбираем первое действие по умолчанию (или "Презентация проведена" если есть)
    const defaultAction = useMemo(() => {
        const presentationAction = availableActions.find(a =>
            a.name.toLowerCase().includes('презентация') &&
            a.name.toLowerCase().includes('проведена')
        );
        return presentationAction || availableActions[0] || null;
    }, [availableActions]);

    const [selectedActionCode, setSelectedActionCode] = useState<string>(
        () => defaultAction?.innerCode || ''
    );

    // Обновляем выбранное действие при изменении availableActions
    React.useEffect(() => {
        if (!selectedActionCode && defaultAction) {
            setSelectedActionCode(defaultAction.innerCode);
        }
    }, [defaultAction, selectedActionCode]);

    // Находим выбранное действие
    const selectedAction = availableActions.find(a => a.innerCode === selectedActionCode) || defaultAction;

    // Подготавливаем данные для графика
    const chartData = useMemo(() => {
        if (!report || report.length === 0 || !selectedAction) {
            return { labels: [], datasets: [] };
        }

        const labels = report.map(item => item.userName || 'Менеджер');
        const data = report.map(userReport => {
            const kpi = userReport.kpi.find(
                k => k.action.innerCode === selectedAction.innerCode
            );
            return kpi?.count || 0;
        });

        // Получаем цвет для действия
        const colors = getColors([{ action: selectedAction.action }]);
        const backgroundColor = colors[0] || 'rgba(30, 144, 255, 0.8)';
        const borderColor = backgroundColor.includes('0.8')
            ? backgroundColor.replace('0.8', '1')
            : backgroundColor.includes('rgba')
                ? backgroundColor.replace(/,\s*[\d.]+\)$/, ', 1)')
                : backgroundColor;

        return {
            labels,
            datasets: [{
                label: selectedAction.name,
                data,
                backgroundColor,
                borderColor,
                borderWidth: 1,
            }],
        };
    }, [report, selectedAction]);

    if (!report || report.length === 0 || availableActions.length === 0) {
        return null;
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: selectedAction?.name || 'Выберите действие',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    return (
        <Card className="mb-4">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Показатель по менеджерам</CardTitle>
                    <div className="flex items-center gap-2">
                        <Label htmlFor="action-select" className="text-sm">
                            Действие:
                        </Label>
                        <Select
                            value={selectedActionCode}
                            onValueChange={setSelectedActionCode}
                        >
                            <SelectTrigger id="action-select" className="w-[250px]">
                                <SelectValue placeholder="Выберите действие" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableActions.map(action => (
                                    <SelectItem key={action.innerCode} value={action.innerCode}>
                                        {action.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div style={{ height: '400px' }}>
                    {chartData.labels.length > 0 && chartData.datasets.length > 0 ? (
                        <Bar data={chartData} options={options} />
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            Нет данных для отображения
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

