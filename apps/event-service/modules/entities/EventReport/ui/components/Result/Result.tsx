import { FC, useEffect, useState } from 'react';
import { EV_REPORT_PROP, EventReportStateReport } from '@/modules/entities/EventReport/type/event-report-type';
import { ASelect, EVCard } from '@workspace/april-ui';
import { Department } from '@/modules/features/Departament';
import { DEPARTAMENT_STATE_PROP } from '@/modules/features/Departament/type/department-type';
import WorkStatus from '../WorkStatus/WorkStatus';
import useWindowSize from '@/modules/app/lib/hooks/display';
import { CompanyColor } from '@/modules/entities/EventCompany/ui/components/CompanyColor/CompanyColor';

interface ResultProps {
    report: EventReportStateReport;
    handleChange: (type: EV_REPORT_PROP, value: string) => void;
}

const Result: FC<ResultProps> = ({ report, handleChange }) => {
    const [isDepartmentShow] = useState(false);

    const { width } = useWindowSize();
    const [isSmallDisplay, setIsSmallDisplay] = useState(width < 577);
    useEffect(() => {
        setIsSmallDisplay(width < 577);
    }, [width]);

    return (
        <EVCard
            title={'Результат'}
            width={12}
            size={isSmallDisplay ? 'smallest' : 'small'}
            actionComponent={<CompanyColor />}
        >
            {isDepartmentShow ? (
                <Department from={DEPARTAMENT_STATE_PROP.PLAN} />
            ) : (
                <>
                    <WorkStatus handleChange={handleChange} report={report} />

                    {report[EV_REPORT_PROP.FAIL_TYPE].isActive &&
                        !report[EV_REPORT_PROP.FAIL_REASON].isActive && (
                            <ASelect
                                label={'Тип отказа'}
                                nameForHandler={EV_REPORT_PROP.FAIL_TYPE}
                                handleChange={handleChange}
                                current={report[EV_REPORT_PROP.FAIL_TYPE].current}
                                items={report[EV_REPORT_PROP.FAIL_TYPE].items}
                            />
                        )}
                    {report[EV_REPORT_PROP.FAIL_REASON].isActive && (
                        <div className={isSmallDisplay ? 'flex flex-col gap-2' : 'flex flex-row gap-2'}>
                            <div className="flex-1">
                                <ASelect
                                    label={'Тип отказа'}
                                    nameForHandler={EV_REPORT_PROP.FAIL_TYPE}
                                    handleChange={handleChange}
                                    current={report[EV_REPORT_PROP.FAIL_TYPE].current}
                                    items={report[EV_REPORT_PROP.FAIL_TYPE].items}
                                />
                            </div>
                            <div className="flex-1">
                                <ASelect
                                    label={'Причины отказа'}
                                    nameForHandler={EV_REPORT_PROP.FAIL_REASON}
                                    handleChange={handleChange}
                                    current={report[EV_REPORT_PROP.FAIL_REASON].current}
                                    items={report[EV_REPORT_PROP.FAIL_REASON].items}
                                />
                            </div>
                        </div>
                    )}
                </>
            )}
        </EVCard>
    );
};

export default Result;
