'use client';

import { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Label } from '@workspace/ui/components/label';
import { Switch } from '@workspace/ui/components/switch';
import { Button } from '@workspace/ui/components/button';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    PresentationProp,
    eventPresentationActions,
} from '@/modules/entities/EventPresentation';
import {
    openCheckPresentation,
    selectIsCheckPresentationApplicable,
    selectIsCheckPresentationSatisfied,
} from '@/modules/features/AfterPresentation';

/**
 * Презентация: отметка «проведена» (+ незапланированная).
 * Счётчики презентаций — TODO(бэк): эндпоинт pres/count (см. gap-док).
 */
export const PresentationSection: FC = () => {
    const dispatch = useAppDispatch();
    const presentation = useAppSelector(s => s.eventPresentation);
    const currentTask = useAppSelector(s => s.eventTask.current);

    const isPresTask = currentTask?.eventType === 'presentation';
    const isDone = presentation[PresentationProp.IS_PRESENTATION_DONE];
    const isUnplanned = presentation[PresentationProp.IS_UNPLANNED_PRESENTATION];
    const isCheckApplicable = useAppSelector(selectIsCheckPresentationApplicable);
    const isCheckSatisfied = useAppSelector(selectIsCheckPresentationSatisfied);

    const toggle = (name: PresentationProp) => (value: boolean) =>
        dispatch(eventPresentationActions.setPresentationProp({ name, value }));

    return (
        <Card data-event-type="presentation">
            <CardHeader>
                <CardTitle className="text-base text-event-current">
                    Презентация
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {isPresTask && (
                    <div className="flex items-center justify-between">
                        <Label htmlFor="pres-done">Презентация проведена</Label>
                        <Switch
                            id="pres-done"
                            checked={isDone}
                            onCheckedChange={toggle(PresentationProp.IS_PRESENTATION_DONE)}
                        />
                    </div>
                )}
                {!isPresTask && (
                    <div className="flex items-center justify-between">
                        <Label htmlFor="pres-unplanned">
                            Провели незапланированную презентацию
                        </Label>
                        <Switch
                            id="pres-unplanned"
                            checked={isUnplanned}
                            onCheckedChange={toggle(
                                PresentationProp.IS_UNPLANNED_PRESENTATION,
                            )}
                        />
                    </div>
                )}

                {isCheckApplicable && (
                    <Button
                        variant={isCheckSatisfied ? 'outline' : 'default'}
                        size="sm"
                        onClick={() => dispatch(openCheckPresentation())}
                    >
                        {isCheckSatisfied
                            ? 'Опросник заполнен — изменить'
                            : 'Заполнить опросник'}
                    </Button>
                )}
            </CardContent>
        </Card>
    );
};
