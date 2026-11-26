import React from 'react';
import KPIChart from './KPIChart';
import { ReportData } from '../../model/types/report/report-type';
import type { IndicatorLabeler } from '@/modules/shared/lib/indicator-labels';

interface GraphicBoardeProps {
    report: ReportData[];
    /** Выводимые названия показателей (подписи графика и легенды). */
    labelOf?: IndicatorLabeler;
}

const GraphicBoard: React.FC<GraphicBoardeProps> = ({ report, labelOf }) => {
    if (!report || !report.length || !report[0]?.kpi) {
        return null;
    }

    return (
        <div className="space-y-4">
            <KPIChart report={report} labelOf={labelOf} />
        </div>
    );
};

export default GraphicBoard;
