'use client';

import { FC } from 'react';
import { Check, Zap } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    PresentationProp,
    eventPresentationActions,
} from '@/modules/entities/EventPresentation';
import {
    openCheckPresentation,
    selectIsCheckPresentationApplicable,
} from '@/modules/features/AfterPresentation';

/**
 * «Была проведена» — та самая яркая кнопка из оригинала.
 *
 * Отмечает презентацию проведённой и сразу открывает опросник, если он
 * применим: раньше это были два разных элемента в разных местах формы.
 * Пока не отмечена — привлекает внимание пульсацией (гейт withPresentationAnimate,
 * как в оригинале); отмеченная становится спокойной кнопкой с галочкой.
 *
 * Для задачи-презентации это «провели запланированную», для остальных —
 * «провели спонтанную»: флаг разный, кнопка одна.
 */
export const PresentationDoneButton: FC = () => {
    const dispatch = useAppDispatch();
    const presentation = useAppSelector(s => s.eventPresentation);
    const currentTask = useAppSelector(s => s.eventTask.current);
    const withAnimate = useAppSelector(
        s => s.app.config.withPresentationAnimate,
    );
    const isCheckApplicable = useAppSelector(
        selectIsCheckPresentationApplicable,
    );

    const isPresTask = currentTask?.eventType === 'presentation';
    const prop = isPresTask
        ? PresentationProp.IS_PRESENTATION_DONE
        : PresentationProp.IS_UNPLANNED_PRESENTATION;
    const isDone = presentation[prop];

    const toggle = () => {
        const next = !isDone;
        dispatch(
            eventPresentationActions.setPresentationProp({
                name: prop,
                value: next,
            }),
        );
        // Опросник имеет смысл только для проведённой презентации.
        if (next && isCheckApplicable) {
            dispatch(openCheckPresentation());
        }
    };

    return (
        <Button
            type="button"
            size="sm"
            variant={isDone ? 'outline' : 'default'}
            onClick={toggle}
            aria-pressed={isDone}
            data-event-type="presentation"
            className={cn(
                'gap-1.5',
                !isDone &&
                    'bg-event-current text-event-current-foreground hover:bg-event-current/90',
                !isDone &&
                    withAnimate &&
                    'animate-pulse motion-reduce:animate-none',
            )}
        >
            {isDone ? (
                <Check aria-hidden className="size-4" />
            ) : (
                <Zap aria-hidden className="size-4" />
            )}
            {isDone
                ? 'Презентация проведена'
                : isPresTask
                  ? 'Провести презентацию'
                  : 'Провели презентацию'}
        </Button>
    );
};
