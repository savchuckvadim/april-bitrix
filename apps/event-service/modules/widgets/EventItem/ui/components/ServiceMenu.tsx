import { FC } from 'react';
import { Comment } from '@/modules/entities/EventComment';
import { PlanService } from '@/modules/entities/EventPlan';
import { EventItemResultType } from '../../model/EventItemSlice';
import { ServiceResults } from '@/modules/entities/ServiceResults/ui/ServiceResults';
import { useTask } from '@/modules/entities/EventServiceTask';
import ServiceSignalReport from '@/modules/features/ServiceSiganal/ui/component/ServiceSignalReport';

interface ServiceMenuProps {
    isSmallDisplay: boolean;
    isTmcMode: boolean;
    menuType: EventItemResultType;
    isNoresultTmc: boolean;
    withPlan: boolean;
    workStatus: string;
}

const AREA = 'w-full md:flex-1 md:min-w-[280px]';

const ServiceMenu: FC<ServiceMenuProps> = ({ isSmallDisplay, withPlan }) => {
    const { isSS } = useTask();

    return (
        <>
            <div className={AREA}>
                <div className="p-0">
                    <ServiceResults />
                    {isSS && (
                        <div className="mt-2 p-0">
                            <ServiceSignalReport type="checkList" withClose={false} />
                        </div>
                    )}
                </div>
                <div className="mt-2 p-0">{!isSS && <Comment />}</div>
            </div>

            {!isSmallDisplay ? (
                <div className={AREA}>
                    <div className="mt-0 p-0">
                        {withPlan && <PlanService />}
                        {isSS && (
                            <div className="mt-2 p-0">
                                <Comment />
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className={AREA}>
                    <div className="mb-3">{withPlan && <PlanService />}</div>
                </div>
            )}
        </>
    );
};

export default ServiceMenu;
