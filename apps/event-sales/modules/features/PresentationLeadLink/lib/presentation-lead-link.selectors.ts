import type { RootState } from '@/modules/app/model/store';
import { PresentationProp } from '@/modules/entities/EventPresentation/model/PresSlice';

/** В отчёте есть факт презентации (проведена либо спонтанная). */
export const selectHasPresentationFact = (state: RootState): boolean =>
    Boolean(
        state.eventPresentation[PresentationProp.IS_PRESENTATION_DONE] ||
            state.eventPresentation[PresentationProp.IS_UNPLANNED_PRESENTATION],
    );

/**
 * Нужно спросить связь «презентация ↔ заявка» перед отправкой:
 * факт презентации есть, а вопрос ещё не закрыт (связали / «не связана»).
 * Есть ли кандидаты — выясняет open-thunk: без открытых лидов вопрос
 * закрывается сам и отправка продолжается без модалки.
 */
export const selectNeedPresentationLeadLink = (state: RootState): boolean =>
    selectHasPresentationFact(state) && !state.presentationLeadLink.resolved;
