import { FC, useEffect, useState } from 'react';
import { EV_REPORT_PROP, EventReportStateReport } from '@/modules/entities/EventReport/type/event-report-type';
import { ASelect, EVCard } from '@workspace/april-ui';
import useWindowSize from '@/modules/app/lib/hooks/display';

interface NoresultProps {
    report: EventReportStateReport;
    handleChange: (type: EV_REPORT_PROP, value: string) => void;
}

const Noresult: FC<NoresultProps> = ({ report, handleChange }) => {
    const noresult = report[EV_REPORT_PROP.NORESULT_REASON];
    const items = noresult.items;
    const current = noresult.current;

    const { width } = useWindowSize();
    const [isSmallDisplay, setIsSmallDisplay] = useState(width < 577);
    useEffect(() => {
        setIsSmallDisplay(width < 577);
    }, [width]);

    return (
        <EVCard title={'Нерезультативный звонок'} width={12} size={isSmallDisplay ? 'smallest' : 'small'}>
            <div className="w-full">
                <ASelect
                    label={'Причины нерезультативности'}
                    nameForHandler={EV_REPORT_PROP.NORESULT_REASON}
                    handleChange={handleChange}
                    current={current}
                    items={items}
                />
            </div>
        </EVCard>
    );
};

export default Noresult;
