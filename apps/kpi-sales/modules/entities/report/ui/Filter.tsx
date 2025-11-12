import React, { useEffect, useState } from 'react';
import EmployeesFilter from './EmployeesFilter/EmployeesFilter';
import DatesFilter from './DatesFilter';
import ManagersFilter from './ManagersFilter';
import ActionsFilter from './ActionsFilter';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import { usePathname, useRouter } from 'next/navigation';

interface FilterProps {
    isOpen: boolean;
}

export const Filter: React.FC<FilterProps> = ({ isOpen }) => {
    // const currentDepartment = useAppSelector(state => state.department.current);
    let isUserReport = false;
    const pathname = usePathname();
    if (pathname === '/report/user') isUserReport = true;





    if (!isOpen) return null;

    return (
        <Card className="mb-4">
            <CardHeader>
                <CardTitle>Фильтры</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                        <DatesFilter />
                        {!isUserReport && <ManagersFilter />}
                    </div>

                    <div className="space-y-4">
                        {!isUserReport && <EmployeesFilter />}
                    </div>
                </div>
            </CardContent>

            {!isUserReport && <CardContent>
                <ActionsFilter />
            </CardContent>}
        </Card>
    );
};

export default Filter;
