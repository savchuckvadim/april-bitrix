import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { changeWorkStatusFromDeadline } from '../../model/EventPlanSlice';
import { EV_REPORT_PROP } from '@/modules/entities/EventReport/type/event-report-type';
import { EventItemResultType } from '@/modules/widgets/EventItem/model/EventItemSlice';
import { EV_PLAN_SERVICE_PROP } from '../../type/event-plan-service-type';
import { EV_PLAN_STATE_SERVICE_ITEM } from '../../model/EventPlanServiceSlice';
import { changePlanEventType } from '../../model/EventPlanServiceThunk';
import { EV_CONTACT_PROP } from '@/modules/entities/EventContact/type/event-contact-type';

/** Service-plan process state + handlers (replaces the old PlanServiceContainer). */
export const usePlanService = () => {
    const dispatch = useAppDispatch();
    const planState = useAppSelector(state => state.eventPlanService);
    const type = planState[EV_PLAN_SERVICE_PROP.TYPE] as EV_PLAN_STATE_SERVICE_ITEM;
    const date = planState[EV_PLAN_SERVICE_PROP.DATE];

    const currentEventResult = useAppSelector(state => state.eventItemMenu.type) as EventItemResultType;
    const isNoResultMenu =
        currentEventResult === EventItemResultType.NORESULT ||
        currentEventResult === EventItemResultType.EXPIRED;

    const workStatus = useAppSelector(
        state => state.eventReport.report[EV_REPORT_PROP.WORK_STATUS].current,
    );

    useEffect(() => {
        dispatch(changeWorkStatusFromDeadline());
    }, [date, workStatus]);

    const planPropChange = (type: EV_PLAN_SERVICE_PROP | EV_CONTACT_PROP, value: string): void => {
        dispatch(changePlanEventType(type as EV_PLAN_SERVICE_PROP, value));
    };

    return { type, date, isNoResultMenu, planPropChange };
};
