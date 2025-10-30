import React from 'react';

import { Badge } from '@workspace/ui/components/badge';
import { useDepartment } from '@/modules/entities/departament';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { IBXUser } from '@workspace/bitrix/src/domain/interfaces/bitrix.interface';

interface EmployeesFilterItemProps {
    user: IBXUser;
}

const EmployeesFilter: React.FC<EmployeesFilterItemProps> = ({ user }) => {
    const { handleSetCurrentDepartmentItem } = useDepartment();
    const selectedManagers = useAppSelector(state => state.department.current);

    return (
        <Badge
            key={user.ID}
            variant={
                selectedManagers.some(
                    (manager: IBXUser) => manager.ID === user.ID,
                )
                    ? 'default'
                    : 'outline'
            }
            className="cursor-pointer "
            onClick={() => handleSetCurrentDepartmentItem(Number(user.ID))}
        >
            {user.NAME} {user.LAST_NAME}
        </Badge>
    );
};

export default EmployeesFilter;
