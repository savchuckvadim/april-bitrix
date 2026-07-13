import { FC } from 'react';
import { Button } from '@workspace/ui/components/button';
import { DepartmentMode } from '@/modules/features/Departament/ui/DepartmentMode';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { APP_DEP } from '@/modules/app/model/AppSlice';
import { ServiceSignalLink } from '@/modules/features/ServiceSiganal';

interface ActionMenuProps {
    isSmallDisplay: boolean;
    isInCallCard: boolean;
    inCallCard: boolean;
    cancel: () => void;
    send: () => void;
}

const ActionMenu: FC<ActionMenuProps> = ({ isSmallDisplay, cancel, send }) => {
    const isServiceDepartment =
        useAppSelector(state => state.app.department) === APP_DEP.SERVICE;

    return (
        <div className="w-full md:w-44">
            <div className="flex flex-col gap-2">
                {!isServiceDepartment && isSmallDisplay && (
                    <div className="mb-1">
                        <DepartmentMode />
                    </div>
                )}

                <Button size="sm" className="w-full" onClick={send}>
                    отправить
                </Button>
                <Button size="sm" variant="outline" className="w-full" onClick={cancel}>
                    отмена
                </Button>

                <ServiceSignalLink />
                {!isServiceDepartment && !isSmallDisplay && <DepartmentMode />}
            </div>
        </div>
    );
};

export default ActionMenu;
