import { useEffect, useState } from 'react';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { EV_REPORT_PROP } from '@/modules/entities/EventReport/type/event-report-type';

/** EventItem menu state + readiness gate (replaces EventItemContainer). */
export const useEventItem = () => {
    const menuType = useAppSelector(state => state.eventItemMenu.type);
    const workStatus = useAppSelector(
        state => state.eventReport.report[EV_REPORT_PROP.WORK_STATUS].current.code,
    );
    const currentTask = useAppSelector(state => state.eventTask.current);
    const isTasksFetched = useAppSelector(state => state.eventTask.isFetched);

    const [isNeedCreate, setIsNeedCreate] = useState(false);

    const getWithPlan = () => workStatus !== 'fail' && workStatus !== 'success';
    const [withPlan, setWithPlan] = useState(getWithPlan());

    useEffect(() => {
        setWithPlan(getWithPlan());
    }, [workStatus]);

    useEffect(() => {
        if (!currentTask && isTasksFetched && !isNeedCreate) {
            setIsNeedCreate(true);
        }
    }, [currentTask, isTasksFetched, isNeedCreate]);

    const showPreloader = !currentTask && isTasksFetched && !isNeedCreate;

    return { menuType, withPlan, showPreloader };
};
