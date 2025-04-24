import React from 'react';
import { useReport } from '../model';

import Filter from './Filter';

import KPIReportTable from './Tables/KPIReportTable';
import Graphics from './Graphics';

import { Processing } from '@/modules/shared';
import ReportHeader from './ReportHeader/ReportHeader';
import { CallingStatistics } from '../../calling-statistics';
const Report = () => {
    const {
        report,
        isLoading,
        isFetched,
        // handleUpdateReport,
    } = useReport();


    const [isFilterOpen, setIsFilterOpen] = React.useState(false);
    const [mounted, setMounted] = React.useState(false);


    React.useEffect(() => {
        setMounted(true);
    }, []);



    if (!mounted) {
        return null;
    }

    return (

        <div className=" p-7">
            {isLoading || !isFetched ?
                <Processing />
                : (<>
                   
                    <ReportHeader
                        isFilterOpen={isFilterOpen}
                        setIsFilterOpen={setIsFilterOpen}
                    />
                    <Filter
                        isOpen={isFilterOpen}

                    />



                    {isLoading && isFetched ? (
                        <div className="flex justify-center items-center h-5/6 mt-3">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                        </div>
                    ) : (
                        <div>
                            <KPIReportTable report={report} />
                            <div className='mt-3'>
                                <Graphics />
                            </div>
                            <div>
                                <CallingStatistics />
                            </div>
                        </div>
                    )}

                </>)}
        </div>
    );
};

export default Report; 