'use client';

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    PresentationProp,
    eventPresentationActions,
} from '@/modules/entities/EventPresentation';
import {
    getPresentationHint,
    type PresentationHint,
} from '@/modules/entities/EventPresentation/lib/presentation-hint';
import {
    openCheckPresentation,
    selectIsCheckPresentationApplicable,
} from '@/modules/features/AfterPresentation';

export interface PresentationDoneView {
    isDone: boolean;
    /** Событие планировалось презентацией — флаг и тексты другие. */
    isPresTask: boolean;
    hint: PresentationHint;
    toggle: () => void;
}

/**
 * Отметка «презентация проведена» — одно состояние на всех, кто её показывает.
 *
 * Для задачи-презентации это «провели запланированную» (IS_PRESENTATION_DONE),
 * для остальных — «провели спонтанную» (IS_UNPLANNED_PRESENTATION): флаг
 * разный, отметка одна. Раньше эта развилка была скопирована в кнопку, чип
 * пульта и хук пульта — три копии одного правила.
 */
export const usePresentationDone = (): PresentationDoneView => {
    const dispatch = useAppDispatch();
    const presentation = useAppSelector(s => s.eventPresentation);
    const currentTask = useAppSelector(s => s.eventTask.current);
    const isCheckApplicable = useAppSelector(
        selectIsCheckPresentationApplicable,
    );

    const isPresTask = currentTask?.eventType === 'presentation';
    const prop = isPresTask
        ? PresentationProp.IS_PRESENTATION_DONE
        : PresentationProp.IS_UNPLANNED_PRESENTATION;
    const isDone = Boolean(presentation[prop]);

    const toggle = useCallback(() => {
        const next = !isDone;
        dispatch(
            eventPresentationActions.setPresentationProp({
                name: prop,
                value: next,
            }),
        );
        // Опросник имеет смысл только для проведённой презентации.
        if (next && isCheckApplicable) dispatch(openCheckPresentation());
    }, [dispatch, isCheckApplicable, isDone, prop]);

    return {
        isDone,
        isPresTask,
        hint: getPresentationHint(isDone, isPresTask),
        toggle,
    };
};
