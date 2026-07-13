import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { FC } from 'react';
import { ATogglerColor } from '@workspace/april-ui';
import { EV_COMMUNICATION_STATE_PARTS } from '../type/communications-type';
import { EV_TARGET } from '@/modules/processes/event/types/ev-process-type';
import { eventCommunicationActions } from '../model/EventCommunicationSlice';
import { SetCurrentCommunication } from '../type/action-type';

const Communication: FC<{ from: EV_TARGET }> = ({ from }) => {
    const communication = useAppSelector(state => state.eventCommunication);

    const communicationValues = communication[EV_COMMUNICATION_STATE_PARTS.TYPE].items;
    const communicationCurrent = communication[EV_COMMUNICATION_STATE_PARTS.TYPE].current[from];
    const communicationisFetched = communication[EV_COMMUNICATION_STATE_PARTS.TYPE].isFetched;

    const initiativeValues = communication[EV_COMMUNICATION_STATE_PARTS.INITIATIVE].items;
    const initiativeCurrent = communication[EV_COMMUNICATION_STATE_PARTS.INITIATIVE].current[from];
    const initiativeFetched = communication[EV_COMMUNICATION_STATE_PARTS.INITIATIVE].isFetched;

    const dispatch = useAppDispatch();
    const set = (data: SetCurrentCommunication) =>
        dispatch(eventCommunicationActions.setCurrent(data));

    return (
        <div className="flex w-full items-center gap-2">
            <div className="flex-1">
                {initiativeFetched && (
                    <ATogglerColor
                        title="инициатива"
                        total={initiativeValues.length}
                        innerValue={initiativeCurrent.name.toLowerCase()}
                        size={'medium'}
                        palit={['april', 'dblue']}
                        onClick={set}
                        onClickData={{
                            type: EV_COMMUNICATION_STATE_PARTS.INITIATIVE,
                            target: from,
                            index: initiativeCurrent.id,
                        }}
                        order={initiativeCurrent.id}
                    />
                )}
            </div>
            <div className="flex-1">
                {communicationisFetched && (
                    <ATogglerColor
                        title="средство"
                        size={'medium'}
                        palit={['dark', 'success', 'fiolet', 'april', 'dblue']}
                        total={communicationValues.length}
                        innerValue={communicationCurrent.name.toLocaleLowerCase()}
                        onClick={set}
                        onClickData={{
                            type: EV_COMMUNICATION_STATE_PARTS.TYPE,
                            target: from,
                            index: communicationCurrent.id,
                        }}
                        order={communicationCurrent.id}
                    />
                )}
            </div>
        </div>
    );
};

export default Communication;
