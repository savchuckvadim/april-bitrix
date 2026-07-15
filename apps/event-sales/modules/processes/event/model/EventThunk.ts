import { AppDispatch, AppGetState } from '@/modules/app/model/store';
import { Placement } from '@workspace/bx';
import { Bitrix } from '@workspace/bitrix';
import { getSavedComment } from '@/modules/entities/EventReport';
import { eventActions } from './EventSlice';

/**
 * Инициализация event-процесса после того, как app shell поднят
 * (вызывается из EventProcessInit один раз после initialized).
 */
export const initialEventApp =
    (foreignPlacement: Placement | null = null) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        let placement = foreignPlacement ?? (state.app.bitrix.placement as Placement | null);

        if (!placement && process.env.IN_BITRIX === 'true') {
            placement = (await Bitrix.getService().api.getPlacement()) as Placement | null;
        }

        dispatch(getSavedComment());
        dispatch(eventActions.setFinishStatus({ status: false, result: '' }));

        if (!placement?.options) {
            dispatch(eventActions.setFullCompleteStatus({ status: true }));
        }
    };
