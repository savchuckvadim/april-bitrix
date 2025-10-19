import React from 'react';
import KPIChart from './KPIChart';
import { ReportData } from '@workspace/nest-api';

interface GraphicBoardeProps {
    report: ReportData[];
}

const GraphicBoard: React.FC<GraphicBoardeProps> = ({ report }) => {
    // const isLoading = useAppSelector(state => state.report.isLoading);
    // const isFetched = useAppSelector(state => state.report.isFetched);

    if (!report || !report.length || !report[0]?.kpi) {
        return null;
    }

    return (
        <div className="space-y-4">
            <KPIChart report={report} />
        </div>
    );
};

export default GraphicBoard;
