import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { eventActions } from '@/modules/processes/event';
import { EV_DEAL_PROP } from '../type/event-deal-type';
import { updateDealContractDate } from '../model/EventDealThunk';

export const useEventDeal = () => {
    const dispatch = useAppDispatch();

    const isActive = useAppSelector(state => state.eventDeal.isActive);
    const contractStart = useAppSelector(
        state => state.eventDeal[EV_DEAL_PROP.CONTRACT_START].current,
    );
    const contractEnd = useAppSelector(
        state => state.eventDeal[EV_DEAL_PROP.CONTRACT_END].current,
    );
    const errors = useAppSelector(state => state.event.errors.current);

    const handleChange = (prop: EV_DEAL_PROP, value: string) => {
        dispatch(updateDealContractDate(prop, value));
    };

    const handleOnFocus = (code: EV_DEAL_PROP, error: string | null) => {
        if (error) {
            dispatch(eventActions.setError({ code, value: '' }));
        }
    };

    return {
        isActive,
        contractStart,
        contractEnd,
        errors,
        handleChange,
        handleOnFocus,
    };
};
