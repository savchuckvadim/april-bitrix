'use client';

import { FC } from 'react';
import { Check } from 'lucide-react';
import { HintTooltip } from '@workspace/april-ui';
import { cn } from '@workspace/ui/lib/utils';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    PresentationProp,
    eventPresentationActions,
} from '@/modules/entities/EventPresentation';
import { getPresentationHint } from '@/modules/entities/EventPresentation/lib/presentation-hint';
import {
    openCheckPresentation,
    selectIsCheckPresentationApplicable,
} from '@/modules/features/AfterPresentation';

/**
 * Дубль отметки «презентация проведена» в пульте отчёта.
 *
 * Та же самая отметка, что у кнопки в шапке — состояние одно на двоих.
 * Здесь она нужна потому, что итог разговора отмечают в пульте: искать
 * глазами кнопку в шапке в этот момент неудобно. Микро-чип, а не кнопка:
 * зовущая кнопка уже есть наверху, дублировать её вес незачем.
 *
 * Тултип объясняет, ОТКУДА взялась отметка и что будет, если её снять
 * (тексты — в presentation-hint): галочка проставляется автоматически, и без
 * объяснения менеджер не понимает, почему звонок засчитан презентацией.
 */
export const PresentationDoneChip: FC = () => {
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
    const isDone = presentation[prop];
    const hint = getPresentationHint(Boolean(isDone), isPresTask);

    const toggle = () => {
        const next = !isDone;
        dispatch(
            eventPresentationActions.setPresentationProp({
                name: prop,
                value: next,
            }),
        );
        if (next && isCheckApplicable) dispatch(openCheckPresentation());
    };

    return (
        <HintTooltip title={hint.title} lines={hint.lines}>
            <button
                type="button"
                onClick={toggle}
                aria-pressed={isDone}
                className={cn(
                    'inline-flex cursor-pointer items-center gap-1 rounded-full border px-2 py-0.5 text-[0.6875rem] whitespace-nowrap',
                    isDone
                        ? 'border-transparent bg-event-pres/20 font-semibold text-event-pres-foreground'
                        : 'border-border text-muted-foreground hover:text-foreground',
                )}
            >
                {isDone && <Check aria-hidden className="size-3" />}
                презентация проведена
            </button>
        </HintTooltip>
    );
};
