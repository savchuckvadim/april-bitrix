import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { FC, useEffect, useState } from 'react';
import { isServiceSignalTask } from '../lib/event-ss-util';
import { serviceSignalActions } from '../model/ServiceSignalSlice';
import { Button } from '@workspace/ui/components/button';
import { motion } from 'framer-motion';

const ServiceSignalLink: FC = () => {
    const dispatch = useAppDispatch();
    const toServiceSignalReport = () =>
        dispatch(serviceSignalActions.setActiveStatus({ status: true }));
    const domain = useAppSelector(state => state.app.domain);

    const currentTask = useAppSelector(state => state.eventTask.current);
    const isSS = currentTask && isServiceSignalTask(domain, currentTask.groupId);
    const [isServiceSignal, setIsSerivceSiganl] = useState(isSS);

    useEffect(() => {
        const next = currentTask && isServiceSignalTask(domain, currentTask.groupId);
        setIsSerivceSiganl(next);
    }, [currentTask]);

    return isServiceSignal ? (
        <motion.div whileTap={{ scale: 0.95 }} className="w-full cursor-pointer">
            <Button className="w-full" onClick={toServiceSignalReport}>
                сигнал
            </Button>
        </motion.div>
    ) : (
        <div />
    );
};

export default ServiceSignalLink;
