import React from 'react';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { Label } from '@workspace/ui/components/label';
import { Badge } from '@workspace/ui/components/badge';
import { useDepartment } from '@/modules/entities/departament/model/use-departament';


const ManagersFilter: React.FC = () => {
    const {

        handleSetCurrentGroup
    } = useDepartment();

    const isHeadManager = useAppSelector(state => state.department.isHeadManager);
    // const department = useAppSelector(state => state.department);
    const { department } = useDepartment()
    if (!isHeadManager) {
        return null;
    }

    return (
        <>

            <div className="space-y-2">
                <Label>Группы</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                    {department.groups.items.map((group) => {
                        const isCurrent = department.groups.current.some(
                            currGroup => currGroup.ID === group.ID
                        );
                        return (
                            <Badge
                                key={group.ID}
                                variant={isCurrent ? "default" : "outline"}
                                className="cursor-pointer"
                                onClick={() => handleSetCurrentGroup(group.ID)}
                            >
                                {group.NAME}
                            </Badge>
                        );
                    })}
                </div>
            </div>
        </>
    );
};

export default ManagersFilter; 