'use client';

import React, { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
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
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { usePersistedSelection } from '@/modules/shared';
import {
    financeEmployeeName,
    formatMoney,
    type FinanceClosedReport,
} from '@/modules/entities/finance';
import {
    financeSeriesColor,
    resolveFinanceColor,
} from '../../lib/finance-colors';

ChartJS.register(ArcElement, Tooltip, Legend);

interface FinanceStructureDonutProps {
    report: FinanceClosedReport;
}

type DonutMode = 'money' | 'employees';

/**
 * Структура денег: режим «Деньги» — аванс vs остаток потенциала
 * (expected − advance); режим «Сотрудники» — доли в месячной сумме.
 */
export const FinanceStructureDonut: React.FC<FinanceStructureDonutProps> = ({
    report,
}) => {
    const departmentItems = useAppSelector(state => state.department.items);
    const [mode, setMode] = usePersistedSelection('kpi-finance-donut-mode');
    const current: DonutMode = mode === 'employees' ? 'employees' : 'money';

    const chart = useMemo(() => {
        if (current === 'money') {
            const advance = report.totals.advanceAmount;
            const potentialRest = Math.max(
                report.totals.expectedContractAmount - advance,
                0,
            );
            return {
                labels: ['Аванс (в кассе)', 'Остаток потенциала'],
                values: [advance, potentialRest],
                colors: [
                    resolveFinanceColor('--finance-advance'),
                    resolveFinanceColor('--finance-potential'),
                ],
            };
        }
        const employees = [...report.employees]
            .sort((a, b) => b.monthlyAmount - a.monthlyAmount)
            .slice(0, 8);
        return {
            labels: employees.map(emp =>
                financeEmployeeName(departmentItems, emp.assignedId),
            ),
            values: employees.map(emp => emp.monthlyAmount),
            colors: employees.map((_emp, i) => financeSeriesColor(i)),
        };
    }, [current, report, departmentItems]);

    if (!chart.values.some(value => value > 0)) return null;

    const chartData = {
        labels: chart.labels,
        datasets: [
            {
                data: chart.values,
                backgroundColor: chart.colors,
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom' as const },
            tooltip: {
                callbacks: {
                    label: (ctx: { label: string; parsed: number }) =>
                        `${ctx.label}: ${formatMoney(ctx.parsed)}`,
                },
            },
        },
    };

    return (
        <Card className="mb-4">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Структура денег</CardTitle>
                    <div className="flex items-center gap-2">
                        <Label className="text-sm">Разрез:</Label>
                        <Select value={current} onValueChange={setMode}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="money">
                                    Аванс / потенциал
                                </SelectItem>
                                <SelectItem value="employees">
                                    Доли сотрудников
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div style={{ height: '320px' }}>
                    <Doughnut data={chartData} options={options} />
                </div>
            </CardContent>
        </Card>
    );
};
