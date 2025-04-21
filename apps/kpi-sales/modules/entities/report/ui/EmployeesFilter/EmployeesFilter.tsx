import React from 'react';
import { Label } from '@workspace/ui/components/label';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import EmployeesFilterItem from './EmployeesFilterItem';


const EmployeesFilter: React.FC = () => {
    // const department = useAppSelector(state => state.department);
    const managers = useAppSelector(state => state.department.items);
    return (
        <div className="space-y-2">
            <Label>Сотрудники</Label>
            <div className="flex flex-wrap gap-2">
                {managers.map((user) => (
                  <EmployeesFilterItem key={user.ID} user={user} />
                ))}
            </div>
        </div>
    );
};

export default EmployeesFilter; 