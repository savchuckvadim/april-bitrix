
import React from 'react';
import { useReport } from '../../model/useReport';


import { Processing } from '@/modules/shared';


export const ReportProvider = ({ children }: { children: React.ReactNode }) => {
    const {

        isLoading,
        isFetched,

    } = useReport();




    return (
        <>
            {isLoading || !isFetched ? (
                <Processing />
            ) : (
               <>{children}</>
            )}


        </>
    );
};


