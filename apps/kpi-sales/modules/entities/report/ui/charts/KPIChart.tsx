import React, { useState } from 'react';
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

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const KPIChart: React.FC = () => {
    const report = useAppSelector(state => state.report.report);
    const actions = useAppSelector(state => state.report.actions.current);

    if (!report || !report.length) {
        return null;
    }

    const labels = report.map((item: any) => item.userName);
    const datasets = actions.map(action => {
        const data = report.map(item => {
            const kpi = item.kpi.find(k => k.action.innerCode === action.innerCode);
            return kpi ? kpi.count : 0;
        });

        return {
            label: action.name,
            data,
            backgroundColor: getColors([{ action }])[0],
        };
    });

    const data = {
        labels,
        datasets,
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'KPI Report',
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
        <Card className='bg-card text-primary'>
            <CardHeader>
                <CardTitle>KPI Chart</CardTitle>
            </CardHeader>
            <CardContent>
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