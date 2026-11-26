import React, { useEffect, useState } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
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
import { getColors } from '../../lib/colors';
import ReportInfo from '../widget/ReportInfo';
import { EyeClosed, Eye } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import { ReportData } from '../../model/types/report/report-type';
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

interface KPIChartProps {
    report: ReportData[];
    /** Выводимые названия показателей; по умолчанию — исходные без лишних пробелов. */
    labelOf?: IndicatorLabeler;
}

const KPIChart: React.FC<KPIChartProps> = ({
    report,
    labelOf = defaultIndicatorLabeler,
}) => {
    const [isMobile, setIsMobile] = useState(false);
    // Хуки — до раннего выхода (раньше useState стоял после него)
    const [infoShow, setInfoShow] = useState(false);

    useEffect(() => {
        const update = () => setIsMobile(window.innerWidth < 640); // или 768, если хочешь md и меньше
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);

    if (!report || !report.length) {
        return null;
    }

    const labels = report.map(item => item.userName ?? '');

    const datasets = report?.[0]?.kpi?.map(kpi => {
        const data = report.map(userReport => {
            const searchedKpi = userReport.kpi.find(
                k => k.action.innerCode === kpi.action.innerCode,
            );
            return searchedKpi?.count || 0;
        });
        return {
            label: labelOf(
                eventLabelKey(kpi.action.innerCode),
                kpi.action.name ?? '',
            ),
            data,
            backgroundColor: getColors([{ action: kpi.action }])[0] as string,
        };
    });
    const data = {
        labels,
        datasets: datasets || [],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: !isMobile,
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'KPI Отчет',
            },
        },

        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };
    return (
        <Card className={cn('bg-card text-primary', isMobile && 'p-1')}>
            {!isMobile && (
                <CardHeader>
                    <CardTitle>KPI Отдела продаж</CardTitle>
                </CardHeader>
            )}
            <CardContent className={cn('', isMobile && 'px-1')}>
                <div className="flex flex-row justify-end cursor-pointer">
                    {infoShow ? (
                        <Eye
                            className="text-primary"
                            onClick={() => setInfoShow(false)}
                        />
                    ) : (
                        <EyeClosed
                            className="hover:text-primary"
                            onClick={() => setInfoShow(true)}
                        />
                    )}
                </div>
                {infoShow && <ReportInfo labelOf={labelOf} />}

                <Bar options={options} data={data} />
            </CardContent>
        </Card>
    );
};

export default KPIChart;
