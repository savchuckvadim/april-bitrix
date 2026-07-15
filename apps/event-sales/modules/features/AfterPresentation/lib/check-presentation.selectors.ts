import { RootState } from '@/modules/app/model/store';
import { PresentationProp } from '@/modules/entities/EventPresentation/model/PresSlice';
import { EventItemResultType } from '@/modules/widgets/EventItem/model/EventItemSlice';
import { buildCheckPresentationComment } from './check-presentation.format';

/**
 * Применим ли хвост вообще: домен с withCheckPresentation, опросник загружен,
 * презентация проведена (плановая или незапланированная) и событие результативное.
 */
export const selectIsCheckPresentationApplicable = (state: RootState): boolean => {
    const withCheckPresentation = state.app.config.withCheckPresentation;
    const initialized = state.afterPresentation.initialized;

    const presentation = state.eventPresentation;
    const isSomePresentation =
        presentation[PresentationProp.IS_PRESENTATION_DONE] ||
        presentation[PresentationProp.IS_UNPLANNED_PRESENTATION];

    const isResult =
        state.eventItemMenu.type === EventItemResultType.RESULT ||
        state.eventItemMenu.type === EventItemResultType.NEW;

    return Boolean(
        withCheckPresentation && initialized && isSomePresentation && isResult,
    );
};

/** Заполнен/подтверждён ли хвост (готов ли к отправке). */
export const selectIsCheckPresentationSatisfied = (state: RootState): boolean =>
    selectIsCheckPresentationApplicable(state) &&
    state.afterPresentation.isConfirmed;

/** Текст хвоста из подтверждённого снимка — для склейки с комментарием. */
export const selectCheckPresentationComment = (state: RootState): string =>
    buildCheckPresentationComment(
        state.afterPresentation.checkPresentation.items,
        state.afterPresentation.checkPresentation.committed,
    );

/** Нужно ли требовать заполнение хвоста перед отправкой. */
export const selectNeedAfterPresentation = (state: RootState): boolean =>
    selectIsCheckPresentationApplicable(state) &&
    !selectIsCheckPresentationSatisfied(state);
