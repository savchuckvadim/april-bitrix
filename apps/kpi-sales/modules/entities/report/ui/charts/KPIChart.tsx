import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
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
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { getColors } from '../../lib/colors';
import ReportInfo from '../widget/ReportInfo';
import { EyeClosed, Eye } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import { useReport } from '../../model';
import { ReportData } from '../../model/types/report/report-type';


ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface KPIChartProps {
    report: ReportData[];
}

const KPIChart: React.FC<KPIChartProps> = ({ report }) => {
    // const report = useAppSelector(state => state.report.report);
    // const actions = useAppSelector(state => state.report.actions.current);
    // const { report } = useReport()
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const update = () => setIsMobile(window.innerWidth < 640); // или 768, если хочешь md и меньше
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);

    if (!report || !report.length) {
        return null;
    }

    const labels = report.map((item: any) => item.userName) as string[];

    const datasets = report?.[0]?.kpi?.map(kpi => {

        const data = report.map(userReport => {
            const searchedKpi = userReport.kpi.find(k => k.action.innerCode === kpi.action.innerCode)
            return searchedKpi?.count || 0
        })
        return {
            label: kpi.action.name as string,
            data,
            backgroundColor: getColors([{ action: kpi.action }])[0] as string,
        }
    })
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
    const [infoShow, setInfoShow] = useState(false);
    return (
        <Card className={cn('bg-card text-primary', isMobile && 'p-1')}>
            {!isMobile && <CardHeader>
                <CardTitle>KPI Отдела продаж</CardTitle>
            </CardHeader>}
            <CardContent className={cn('', isMobile && 'px-1')}>
                <div className='flex flex-row justify-end cursor-pointer'>
                    {
                        infoShow ? <Eye
                            className='text-primary'


                            onClick={() => setInfoShow(false)}
                        />
                            : <EyeClosed className='hover:text-primary' onClick={() => setInfoShow(true)} />
                    }
                </div>
                {infoShow && <ReportInfo />}

                <Bar options={options} data={data} />

            </CardContent>
        </Card>
    );
};

export default KPIChart; 