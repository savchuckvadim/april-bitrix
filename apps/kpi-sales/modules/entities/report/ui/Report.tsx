import React from 'react';
import { useReport } from '../model';
import { Button } from '@workspace/ui/components/button';
import Filter from './Filter';

import KPIReportTable from './Tables/KPIReportTable';
import Graphics from './Graphics';
import { DownLoad } from '@/modules/feature';
import { ThemeToggler } from '@workspace/theme';
import { Processing } from '@/modules/shared';
import ReportHeader from './ReportHeader/ReportHeader';
const Report = () => {
    const {
        report,
        isLoading,
        isFetched,
        handleUpdateReport,
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
                    {/* <div className="flex justify-between items-center mb-4">
                        <div className='flex flex-row'>
                            <ThemeToggler />
                            <h1 className="ml-2  text-xl font-bold">KPI</h1>

                        </div>
                        <div className='flex flex-row items-center '>

                            <div className='mr-2'>
                                {isFilterOpen ?
                                    <Button
                                        variant="default"

                                        onClick={() => {
                                            handleUpdateReport()
                                            setIsFilterOpen(!isFilterOpen)
                                        }}
                                    >
                                        {'Применить'}
                                    </Button>

                                    :
                                    <DownLoad />


                                }
                            </div>
                            <Button
                                variant="outline"
                                className='cursor-pointer'
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                            >
                                {isFilterOpen ? 'Скрыть фильтры' : 'Показать фильтры'}
                            </Button>
                        </div>
                    </div> */}
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
                        </div>
                    )}

                </>)}
        </div>
    );
};

export default Report; 