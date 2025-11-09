'use client'
import React, { useState, useMemo, useEffect } from 'react';
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
import { ReportData } from '@/modules/entities/report/model/types/report/report-type';
import { ReportCallingData } from '@/modules/entities/calling-statistics';
import { getCallingStatisticsTableData } from '@/modules/entities/calling-statistics/lib/ui-util';
import { getReportTableData } from '@/modules/entities/report/lib/ui-util';
import { getMergedReportsData } from '../lib/merge-reports.util';

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

interface MergedSingleActionChartProps {
    report: ReportData[];
    callingsReport: ReportCallingData[];
}

export const MergedSingleActionChart: React.FC<MergedSingleActionChartProps> = ({
    report,
    callingsReport,
}) => {
    // Объединяем данные
    const mergedData = useMemo(() => {
        if (!report || !report.length || !callingsReport || !callingsReport.length) {
            return null;
        }
        const tableKpiData = getReportTableData(report);
        const tableCallingsData = getCallingStatisticsTableData(callingsReport);
        return getMergedReportsData(tableKpiData, tableCallingsData);
    }, [report, callingsReport]);

    // Получаем все доступные действия из объединенных данных
    const availableActions = useMemo(() => {
        if (!mergedData || !mergedData.data || mergedData.data.length === 0) {
            return [];
        }
        const firstUser = mergedData.data[0];
        if (!firstUser || !firstUser.actions || firstUser.actions.length === 0) {
            return [];
        }
        return firstUser.actions.map(action => ({
            name: action.name,
            value: action.value,
        }));
    }, [mergedData]);

    // Выбираем первое действие по умолчанию (или "Презентация проведена" если есть, или звонки > минуты)
    const defaultAction = useMemo(() => {
        const presentationAction = availableActions.find(a =>
            a.name.toLowerCase().includes('презентация') &&
            a.name.toLowerCase().includes('проведена')
        );
        if (presentationAction) return presentationAction;

        const callsOverMinute = availableActions.find(a =>
            a.name.toLowerCase().includes('звонк') &&
            a.name.toLowerCase().includes('минут')
        );
        if (callsOverMinute) return callsOverMinute;

        return availableActions[0] || null;
    }, [availableActions]);

    const [selectedActionName, setSelectedActionName] = useState<string>(
        () => defaultAction?.name || ''
    );

    // Обновляем выбранное действие при изменении availableActions
    useEffect(() => {
        if (!selectedActionName && defaultAction) {
            setSelectedActionName(defaultAction.name);
        }
    }, [defaultAction, selectedActionName]);

    // Находим выбранное действие
    const selectedAction = availableActions.find(a => a.name === selectedActionName) || defaultAction;

    // Подготавливаем данные для графика
    const chartData = useMemo(() => {
        if (!mergedData || !mergedData.data || mergedData.data.length === 0 || !selectedAction) {
            return { labels: [], datasets: [] };
        }

        const labels = mergedData.data.map(item => item.name);
        const data = mergedData.data.map(userData => {
            const action = userData.actions.find(a => a.name === selectedAction.name);
            return action?.value || 0;
        });

        // Генерируем цвет для действия
        const colors = [
            'rgba(30, 144, 255, 0.8)',   // Синий
            'rgba(255, 140, 0, 0.8)',    // Оранжевый
            'rgba(35, 186, 35, 0.8)',    // Зеленый
            'rgba(255, 96, 85, 0.8)',    // Красный
            'rgba(202, 176, 255, 0.8)',  // Фиолетовый
            'rgba(106, 180, 242, 0.8)',  // Голубой
            'rgba(255, 215, 0, 0.8)',    // Золотой
            'rgba(68, 213, 144, 0.8)',   // Мятный
        ];

        // Выбираем цвет в зависимости от типа действия
        let backgroundColor = colors[0];
        if (selectedAction.name.toLowerCase().includes('презентация')) {
            backgroundColor = colors[1]; // Оранжевый
        } else if (selectedAction.name.toLowerCase().includes('звонк')) {
            backgroundColor = colors[0]; // Синий
        } else if (selectedAction.name.toLowerCase().includes('кп') || selectedAction.name.toLowerCase().includes('счет')) {
            backgroundColor = colors[2]; // Зеленый
        }

        const borderColor = backgroundColor && backgroundColor.includes('0.8')
            ? backgroundColor.replace('0.8', '1')
            : backgroundColor && backgroundColor.includes('rgba')
                ? backgroundColor.replace(/,\s*[\d.]+\)$/, ', 1)')
                : backgroundColor || '';

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
    }, [mergedData, selectedAction]);

    if (!mergedData || !mergedData.data || mergedData.data.length === 0 || availableActions.length === 0) {
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
                    <CardTitle>Показатель по менеджерам (объединенный отчет)</CardTitle>
                    <div className="flex items-center gap-2">
                        <Label htmlFor="merged-action-select" className="text-sm">
                            Действие:
                        </Label>
                        <Select
                            value={selectedActionName}
                            onValueChange={setSelectedActionName}
                        >
                            <SelectTrigger id="merged-action-select" className="w-[250px]">
                                <SelectValue placeholder="Выберите действие" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableActions.map(action => (
                                    <SelectItem key={action.name} value={action.name}>
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

