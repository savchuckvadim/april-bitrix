import React from 'react';
import EmployeesFilter from './EmployeesFilter/EmployeesFilter';
import DatesFilter from './DatesFilter';
import ManagersFilter from './ManagersFilter';
import ActionsFilter from './ActionsFilter';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';

interface FilterProps {
    isOpen: boolean;

}

export const Filter: React.FC<FilterProps> = ({
    isOpen,
}) => {
    // const currentDepartment = useAppSelector(state => state.department.current);

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

export default Filter; 