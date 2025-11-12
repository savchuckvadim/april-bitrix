// import dynamic from 'next/dynamic';
'use client';
import { Report } from "@/modules/entities/report";


// const DynamicReport = dynamic(() => import('@/modules/entities/report/ui/Report'), { ssr: false });


export default function ReportPage() {

    return <Report />;
}
