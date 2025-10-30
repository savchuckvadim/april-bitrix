import React from 'react';

import GraphicBoard from './charts/GraphicBoard';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import KPITotal from './Dashboards/KPITotalBoard';

import { OrkReportKpiData as ReportData } from '@workspace/nest-api';

interface GraphicsProps {
    report: ReportData[];
}
const Graphics: React.FC<GraphicsProps> = ({ report }) => {
    const isLoading = useAppSelector(state => state.report.isLoading);
    const isFetched = useAppSelector(state => state.report.isFetched);
    // const report = useAppSelector(state => state.report.report)

    // const { isNoReportData } = useReport()
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (!isFetched || !report || report.length === 0) {
        return null;
    }

    return (
        <div className="grid grid-cols-1 gap-4">
            <GraphicBoard report={report} />
            {/* <KPITotal /> */}
            {/* VoximplantBoard */}
            {/* KPIReportTable */}
            {/* CallingReportTable */}
        </div>
    );
};

export default Graphics;
