import { FC } from 'react';
import { Report } from '@/modules/entities/EventReport';
import { Comment } from '@/modules/entities/EventComment';
import { Presentation } from '@/modules/entities/EventPresentation';
import { Plan } from '@/modules/entities/EventPlan';
import { EventSale } from '@/modules/entities/EventSale';
import { EventItemResultType } from '../../model/EventItemSlice';

interface SalesMenuProps {
    isSmallDisplay: boolean;
    isTmcMode: boolean;
    menuType: EventItemResultType;
    isNoresultTmc: boolean;
    withPlan: boolean;
    workStatus: string;
}

const AREA = 'w-full md:flex-1 md:min-w-[280px]';

const SalesMenu: FC<SalesMenuProps> = ({
    isSmallDisplay,
    isTmcMode,
    menuType,
    withPlan,
    workStatus,
}) => {
    return (
        <>
            <div className={AREA}>
                <div className="p-0">
                    <Report isNoResult={false} />
                </div>
                <div className="mt-2 p-0">
                    <Comment />
                </div>
            </div>

            {!isSmallDisplay ? (
                <div className={AREA}>
                    {!isTmcMode && (
                        <div>
                            {menuType === 'result' || menuType === 'new' ? (
                                <Presentation />
                            ) : (
                                <Report isNoResult={true} />
                            )}
                        </div>
                    )}
                    {isTmcMode && (
                        <div>
                            {menuType !== 'result' && menuType !== 'new' && (
                                <Report isNoResult={true} />
                            )}
                        </div>
                    )}
                    <div className="mt-2 p-0">
                        {withPlan && <Plan />}
                        {workStatus === 'success' && <EventSale />}
                    </div>
                </div>
            ) : (
                <div className={AREA}>
                    <div className="mb-3">{withPlan && <Plan />}</div>
                    {!isTmcMode && (
                        <div className="mt-2 p-0">
                            {menuType === 'result' || menuType === 'new' ? (
                                <Presentation />
                            ) : (
                                <Report isNoResult={true} />
                            )}
                        </div>
                    )}
                    {isTmcMode && (
                        <div className="mt-2 p-0">
                            {menuType !== 'result' && menuType !== 'new' && (
                                <Report isNoResult={true} />
                            )}
                        </div>
                    )}
                    {workStatus === 'success' && (
                        <div className="mt-2 p-0">
                            <EventSale />
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default SalesMenu;
