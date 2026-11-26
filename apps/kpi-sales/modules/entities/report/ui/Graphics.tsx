import React from 'react';

import GraphicBoard from './charts/GraphicBoard';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { ReportData } from '../model/types/report/report-type';
import type { IndicatorLabeler } from '@/modules/shared/lib/indicator-labels';

interface GraphicsProps {
    report: ReportData[];
    /** Выводимые названия показателей (подписи графика и легенды). */
    labelOf?: IndicatorLabeler;
}
const Graphics: React.FC<GraphicsProps> = ({ report, labelOf }) => {
    const isLoading = useAppSelector(state => state.report.isLoading);
    const isFetched = useAppSelector(state => state.report.isFetched);
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
            <GraphicBoard report={report} labelOf={labelOf} />
        </div>
    );
};

export default Graphics;
