'use client';
import React from 'react';
import EmployeesFilter from './components/EmployeesFilter/EmployeesFilter';
import DatesFilter from './components/DatesFilter';
import ManagersFilter from './components/ManagersFilter';
import ActionsFilter from './components/ActionsFilter';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import { useReport } from '@/modules/entities';
import { usePathname } from 'next/navigation';




export const Filter: React.FC = () => {
    // const currentDepartment = useAppSelector(state => state.department.current);
    const { isFilterOpen: isOpen } = useReport();
    const pathname = usePathname();
    const isFinance = pathname === '/report/financial';

    if (isFinance) return null;

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
                        <ManagersFilter />
                    </div>

                    <div className="space-y-4">
                        <EmployeesFilter />
                    </div>
                </div>
            </CardContent>

            <CardContent>
                <ActionsFilter />
            </CardContent>
        </Card>
    );
};


