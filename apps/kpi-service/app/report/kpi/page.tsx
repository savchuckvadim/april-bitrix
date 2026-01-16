// 'use client';

// import { Report } from '@/modules/entities/report';
import dynamic from 'next/dynamic';



const DynamicReport = dynamic(() =>
    import('@/modules/entities/report')
        .then(mod => mod.Report));


export default function ReportPage() {
    return <DynamicReport />;
}
