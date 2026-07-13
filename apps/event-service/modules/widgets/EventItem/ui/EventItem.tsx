import React, { FC, useEffect, useState } from 'react';
import { cn } from '@workspace/ui/lib/utils';
import { EventItemResultType } from '../model/EventItemSlice';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { send } from '@/modules/processes/event';
import { cancelResultMenu } from '../model/EventItemThunk';
import { EV_REPORT_PROP } from '@/modules/entities/EventReport/type/event-report-type';
import { DEPARTAMENT_STATE_PROP } from '@/modules/features/Departament/type/department-type';
import useWindowSize from '@/modules/app/lib/hooks/display';
import SalesMenu from './components/SalesMenu';
import ActionMenu from './components/ActionMenu';
import ServiceMenu from './components/ServiceMenu';
import { APP_DEP } from '@/modules/app/model/AppSlice';
import { APP_DISPLAY_MODE } from '@/modules/app/types/app/app-type';
import { ServiceSignalReport } from '@/modules/features/ServiceSiganal';
import { Preloader } from '@/modules/shared/Preloader';
import { useEventItem } from '../lib/hooks/use-event-item';

const EventItem: FC = () => {
    const { menuType, withPlan, showPreloader } = useEventItem();
    const { width } = useWindowSize();
    const [isSmallDisplay, setIsSmallDisplay] = useState(width < 577);

    useEffect(() => {
        setIsSmallDisplay(width < 577);
    }, [width]);

    const dispatch = useAppDispatch();
    const sendEvent = () => dispatch(send());
    const cancel = () => dispatch(cancelResultMenu());

    const workStatus = useAppSelector(
        state => state.eventReport.report[EV_REPORT_PROP.WORK_STATUS].current.code,
    );
    const app = useAppSelector(state => state.app);
    const sale = useAppSelector(state => state.eventSale);
    const currentDepartmentMode = useAppSelector(
        state => state.department[DEPARTAMENT_STATE_PROP.MODE].current,
    );
    const appDep = app.department;
    const isService = appDep === APP_DEP.SERVICE;
    const isTmcMode = currentDepartmentMode.code === 'tmc';

    const inEntityCard = app.display.mode === APP_DISPLAY_MODE.ENTITY_CARD;
    const inCallCard = app.display.mode === APP_DISPLAY_MODE.CALL_CARD;

    const isNoResult = menuType === EventItemResultType.NORESULT;
    const isNoresultTmc = isTmcMode && isNoResult;
    const isSSMenuActive = useAppSelector(state => state.serviceSignal.isActive);

    if (showPreloader) {
        return <Preloader />;
    }

    return (
        <div
            className={cn(
                'w-full rounded-xl bg-card p-2',
                inEntityCard && 'shadow-sm',
                inCallCard && 'border border-border',
            )}
        >
            <div className="flex flex-wrap gap-2 p-2">
                {!isService ? (
                    <SalesMenu
                        isNoresultTmc={isNoresultTmc}
                        isSmallDisplay={isSmallDisplay}
                        isTmcMode={isTmcMode}
                        menuType={menuType}
                        withPlan={withPlan}
                        workStatus={workStatus}
                    />
                ) : !isSSMenuActive ? (
                    <ServiceMenu
                        isNoresultTmc={isNoresultTmc}
                        isSmallDisplay={isSmallDisplay}
                        isTmcMode={isTmcMode}
                        menuType={menuType}
                        withPlan={withPlan}
                        workStatus={workStatus}
                    />
                ) : (
                    <ServiceSignalReport type="info" withClose={true} />
                )}
                <ActionMenu
                    inCallCard={inCallCard}
                    isInCallCard={inCallCard}
                    isSmallDisplay={isSmallDisplay}
                    send={sendEvent}
                    cancel={cancel}
                />
                <div className="min-h-[10px]" />
            </div>
        </div>
    );
};

export default EventItem;
