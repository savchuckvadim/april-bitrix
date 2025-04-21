import React from 'react';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import KPIChart from './KPIChart';

const GraphicBoard: React.FC = () => {
    const isLoading = useAppSelector(state => state.report.isLoading);
    const isFetched = useAppSelector(state => state.report.isFetched);

    if (isLoading) {
        // return (
        //     <Card>
        //         <CardContent className="flex justify-center items-center h-64">
        //             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        //         </CardContent>
        //     </Card>
        // );
        return null;
    }

    if (!isFetched) {
        return null;
    }

    return (
        <div className="space-y-4">
            <KPIChart />
        </div>
    );
};

export default GraphicBoard; 