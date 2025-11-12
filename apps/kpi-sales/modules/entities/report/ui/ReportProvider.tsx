'use client'
import React from 'react';
import { useReport } from '../model';

import Filter from './Filter';


import { Processing } from '@/modules/shared';
import ReportHeader from './ReportHeader/ReportHeader';

import NoreportData from './components/NoreportData';



export const ReportProvider = ({ children }: { children: React.ReactNode }) => {
    const {
        report,
        isLoading,
        isFetched,

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
            {isLoading || !isFetched ? (
                <Processing />
            ) : (
                <>
                    <div className="bg-background/50 backdrop-blur-sm fixed top-0 left-0 right-0 z-10 min-w-full">

                        <div className="flex justify-between items-center h-15 p-5 w-full">
                            <ReportHeader
                                isFilterOpen={isFilterOpen}
                                setIsFilterOpen={setIsFilterOpen}
                            />
                        </div>
                        <div className="px-15">
                            <Filter isOpen={isFilterOpen} />
                            {
                                isFilterOpen && <div className="h-screen w-screen "></div>
                            }
                        </div>

                    </div>
                    {isLoading && isFetched ? (
                        <div className="flex justify-center items-center h-5/6 mt-3">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                        </div>
                    ) : (
                        <>
                            {!report || !report.length ? (
                                <NoreportData />
                            ) : (
                                <div>
                                    {children}
                                </div>
                            )}
                        </>
                    )}
                </>
            )}
        </div>
    );
};


