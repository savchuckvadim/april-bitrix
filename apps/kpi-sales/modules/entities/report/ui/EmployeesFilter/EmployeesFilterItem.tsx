import React from 'react';
import { Label } from '@workspace/ui/components/label';
import { Badge } from '@workspace/ui/components/badge';

import { BXUser } from '@workspace/bx';
import { useDepartment } from '@/modules/entities/departament';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';

interface EmployeesFilterItemProps {

    user: BXUser
}

const EmployeesFilter: React.FC<EmployeesFilterItemProps> = ({ user }) => {
    const { handleSetCurrentDepartmentItem } = useDepartment()
    const selectedManagers = useAppSelector(state => state.department.current);

    return (
        <Badge
            key={user.ID}
            variant={selectedManagers.some((manager: BXUser) => manager.ID === user.ID) ? "default" : "outline"}
            className="cursor-pointer "
            onClick={() => handleSetCurrentDepartmentItem(user.ID)}
        >
            {user.NAME} {user.LAST_NAME}
        </Badge>
    );
};

export default EmployeesFilter; 