import React from 'react';
import dynamic from 'next/dynamic';



const ManageReportFilterDynamic = dynamic(() =>
    import('../ReportFilter/ManageReportFilter/ManageReportFilter')
        .then(mod => mod.ManageReportFilter), {
    ssr: false,
});
const ThemeTogglePanelDynamic = dynamic(() => import('./components/ThemeTogglePanel').then(mod => mod.ThemeTogglePanel), {
    ssr: false,
});

const FilterDynamic = dynamic(() => import('../ReportFilter/').then(mod => mod.Filter), {
    ssr: false,
});
const NavigationDynamic = dynamic(() => import('./components/Navigation').then(mod => mod.Navigation), {
    ssr: false,
});
export default function Header() {


    return (
        <>
            <div className="flex justify-between items-start mb-5">
                {/* <div className="flex flex-row">

                    <h1 className="text-xl font-bold mx-2">KPI</h1>
                    <h1 className="text-xl font-bold mx-2">Финансы</h1>
                </div> */}
                <NavigationDynamic />
                <div className="flex flex-row justify-end items-center gap-2">
                    <ManageReportFilterDynamic />
                    <div className=' flex justify-end items-center'>
                        <ThemeTogglePanelDynamic />
                    </div>

                </div>
            </div>
            <FilterDynamic />
        </>
    );
}
