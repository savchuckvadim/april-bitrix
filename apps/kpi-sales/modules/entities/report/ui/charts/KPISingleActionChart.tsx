'use client'
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
import { usePersistedSelection } from '@/modules/shared';
import {
    defaultIndicatorLabeler,
    eventLabelKey,
    type IndicatorLabeler,
} from '@/modules/shared/lib/indicator-labels';

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
    /** Выводимые названия показателей; по умолчанию — исходные без лишних пробелов. */
    labelOf?: IndicatorLabeler;
}

export const KPISingleActionChart: React.FC<KPISingleActionChartProps> = ({
    report,
    labelOf = defaultIndicatorLabeler,
}) => {
    // Получаем все доступные действия из первого отчета
    const availableActions = useMemo(() => {
        if (!report || report.length === 0 || !report[0]?.kpi) {
            return [];
        }
        // name — исходное (по нему выбор по умолчанию), label — для показа
        return report[0].kpi.map(kpi => ({
            innerCode: kpi.action.innerCode,
            name: kpi.action.name || 'Unknown',
            label: labelOf(
                eventLabelKey(kpi.action.innerCode),
                kpi.action.name || 'Unknown',
            ),
            action: kpi.action,
        }));
    }, [report, labelOf]);

    // Выбираем первое действие по умолчанию (или "Презентация проведена" если есть)
    const defaultAction = useMemo(() => {
        const presentationAction = availableActions.find(a =>
            a.name.toLowerCase().includes('презентация') &&
            a.name.toLowerCase().includes('проведена')
        );
        return presentationAction || availableActions[0] || null;
    }, [availableActions]);

    // Память выбранного показателя (localStorage, next-safe)
    const [selectedActionCode, setSelectedActionCode] =
        usePersistedSelection('kpi-action-events');

    // Выбранное действие: сохранённое, если оно ещё в фильтре, иначе дефолт
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
                label: selectedAction.label,
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
                text: selectedAction?.label || 'Выберите действие',
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
                            value={selectedAction?.innerCode ?? ''}
                            onValueChange={setSelectedActionCode}
                        >
                            <SelectTrigger id="action-select" className="w-[250px]">
                                <SelectValue placeholder="Выберите действие" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableActions.map(action => (
                                    <SelectItem key={action.innerCode} value={action.innerCode}>
                                        {action.label}
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

