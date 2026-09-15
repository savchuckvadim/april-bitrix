import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import { Placement } from '@workspace/bx';
import { Bitrix } from '@workspace/bitrix';
import { getSavedComment } from '@/modules/entities/EventReport';
// Прямой путь, а не барель фичи: барель тянет UI-диалог чек-листа.
import { restoreChecklistDraft } from '@/modules/features/CallChecklist/model/ChecklistDraftThunk';
import { eventActions } from './EventSlice';

/**
 * Инициализация event-процесса после того, как app shell поднят
 * (вызывается из EventProcessInit один раз после initialized).
 */
export const initialEventApp =
    (foreignPlacement: Placement | null = null) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        let placement =
            foreignPlacement ??
            (state.app.bitrix.placement as Placement | null);
        if (!placement && process.env.IN_BITRIX === 'true') {
            placement =
                (await Bitrix.getService().api.getPlacement()) as Placement | null;
        }

        dispatch(getSavedComment());
        // Ответы анкет, живущие только в стейте (продажа, смарт, блоки
        // комментария), — тем же черновиком и в тот же момент, что
        // комментарий: они одинаково не переживают перезагрузку фрейма.
        void dispatch(restoreChecklistDraft());
        dispatch(eventActions.setFinishStatus({ status: false, result: '' }));

        if (!placement?.options) {
            dispatch(eventActions.setFullCompleteStatus({ status: true }));
        }
    };
