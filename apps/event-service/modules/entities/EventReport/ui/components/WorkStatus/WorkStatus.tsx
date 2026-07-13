import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { getCurrentWorkStatusItems } from '@/modules/entities/EventReport/lib/work-status-util';
import { EV_REPORT_PROP, EventReportStateReport } from '@/modules/entities/EventReport/type/event-report-type';
import { DEPARTAMENT_STATE_PROP } from '@/modules/features/Departament/type/department-type';
import { ASelect } from '@workspace/april-ui';
import { FC, useEffect, useState } from 'react';
import { EV_COMPANY_PROP } from '@/modules/entities/EventCompany/model/EventCompanySlice';
import { updateCompany } from '@/modules/entities/EventCompany/model/EventCompanyThunk';
import { PreloaderMicro } from '@/modules/shared/Preloader';

interface WorkStatusProps {
    report: EventReportStateReport;
    handleChange: (type: EV_REPORT_PROP, value: string) => void;
}

const WorkStatus: FC<WorkStatusProps> = ({ report, handleChange }) => {
    const departmentMode = useAppSelector(
        state => state.department[DEPARTAMENT_STATE_PROP.MODE].current.code,
    );

    const workStatusItems = getCurrentWorkStatusItems(report, departmentMode);
    const [currentworkStatusItems, setCurrentWorkStatusItems] = useState(workStatusItems);

    useEffect(() => {
        setCurrentWorkStatusItems(getCurrentWorkStatusItems(report, departmentMode));
    }, [report]);

    const companyStatusCurrent = useAppSelector(state => state.company.status.current);
    const companyStatusItems = useAppSelector(state => state.company.status.items);
    const dispatch = useAppDispatch();

    const setClientStatus = (type: EV_COMPANY_PROP, value: string) =>
        dispatch(updateCompany(type, value));

    const isStatusLoading = useAppSelector(
        state => state.company[EV_COMPANY_PROP.STATUS].isLoading,
    );

    return (
        <div className="flex w-full flex-col gap-2 md:flex-row">
            <div className="flex-1">
                <ASelect
                    label={'Статус Работы'}
                    nameForHandler={EV_REPORT_PROP.WORK_STATUS}
                    handleChange={handleChange}
                    current={report[EV_REPORT_PROP.WORK_STATUS].current}
                    items={currentworkStatusItems}
                />
            </div>
            <div className="flex-1">
                {!isStatusLoading ? (
                    <ASelect
                        label={'Статус Клиента'}
                        nameForHandler={EV_COMPANY_PROP.STATUS}
                        handleChange={setClientStatus}
                        current={companyStatusCurrent}
                        items={companyStatusItems}
                    />
                ) : (
                    <div className="flex items-center justify-center p-2">
                        <PreloaderMicro phrase="Загрузка .  .   ." />
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkStatus;
