'use client';
import { useReport } from '@/modules/entities';
import { FilterButtonGo } from './components/FilterButtonGo';
import { FilterButtonShow } from './components/FilterButtonShow';
import { usePathname } from 'next/navigation';


export const ManageReportFilter = () => {
    const pathname = usePathname();
    const isFinance = pathname === '/report/financial';
    const { isFilterOpen, setIsFilterOpen } = useReport();
    if (isFinance) return null;
    return (
        <div className="flex flex-row items-center ">
            {/* <div className="mr-2">{isFilterOpen && <SaveFilter />}</div> */}
            <div className="mr-2">
                {isFilterOpen && (
                    <>
                        <FilterButtonGo isFilterOpen={isFilterOpen} setIsFilterOpen={setIsFilterOpen} />
                    </>
                )}
            </div>
            <FilterButtonShow isFilterOpen={isFilterOpen} setIsFilterOpen={setIsFilterOpen} />
        </div>
    );
};
