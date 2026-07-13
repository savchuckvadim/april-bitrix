import { FC, useEffect, useState } from 'react';
import { ASelect } from '@workspace/april-ui';
import { DEPARTAMENT_STATE_PROP, DepartmentModeStateItemCode } from '@/modules/features/Departament/type/department-type';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { departmentActions } from '@/modules/features/Departament';
import { eventReportActions } from '@/modules/entities/EventReport';

export const DepartmentMode: FC = () => {
    const [isModeActive, setModeStatus] = useState(false);
    const departmentState = useAppSelector(state => state.department);
    const dMode = departmentState[DEPARTAMENT_STATE_PROP.MODE];

    const dispatch = useAppDispatch();
    const setCurrentMode = (type: DEPARTAMENT_STATE_PROP.MODE, value: string) => {
        const code = value as DepartmentModeStateItemCode;
        dispatch(departmentActions.setMode({ code }));
        dispatch(eventReportActions.setMode({ code }));
    };

    useEffect(() => {
        setModeStatus(false);
    }, [dMode.current]);

    return (
        <div className="w-full text-right">
            {isModeActive ? (
                <ASelect
                    nameForHandler={DEPARTAMENT_STATE_PROP.MODE}
                    handleChange={setCurrentMode}
                    current={dMode.current}
                    items={dMode.items}
                    withLabel={false}
                />
            ) : (
                <p
                    className="cursor-pointer text-sm text-muted-foreground"
                    onDoubleClick={() => setModeStatus(true)}
                    onTouchEnd={() => setModeStatus(true)}
                >
                    {dMode.current.name}
                </p>
            )}
        </div>
    );
};
