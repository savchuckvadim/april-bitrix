import { useAppDispatch } from '@/modules/app/lib/hooks/redux';
import { EventTask } from '@/modules/entities/EventTask/types/event-task-type';
import { getResultMenu } from '@/modules/widgets/EventItem';
import { EventItemResultType } from '@/modules/widgets/EventItem/model/EventItemSlice';
import { AButton } from '@workspace/april-ui';
import { RefreshCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { reloadApp } from '@/modules/app/model/AppThunk';

const EventListHeader = () => {
    const dispatch = useAppDispatch();

    const setResultMenuStatus = (status: EventItemResultType, task: EventTask) => {
        dispatch(getResultMenu(status, task));
    };

    const reload = () => dispatch(reloadApp());

    return (
        <div className="mt-2 flex w-full items-center justify-between">
            <motion.div
                whileTap={{ scale: 0.9 }}
                onClick={reload}
                className="cursor-pointer text-muted-foreground hover:text-foreground"
            >
                <RefreshCcw className="h-4 w-4" />
            </motion.div>

            <div className="flex items-end justify-end">
                <div className="ms-2">
                    <AButton
                        title="+ создать"
                        align="center"
                        color="blue"
                        size="medium"
                        clickHendler={() => setResultMenuStatus(EventItemResultType.NEW, null as any)}
                        isActive={true}
                    />
                </div>
            </div>
        </div>
    );
};

export default EventListHeader;
