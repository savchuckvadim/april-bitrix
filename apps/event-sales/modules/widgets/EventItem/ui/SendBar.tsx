'use client';

import { FC } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { send, useEventNavigation } from '@/modules/processes/event';
import { cancelResultMenu } from '../model/EventItemThunk';

/**
 * Панель действий: Отправить (send: валидация → опросник → flow) / Отмена.
 * Переход на Finish — декларативно через event.isFinish (EventProcessInit).
 */
export const SendBar: FC = () => {
    const dispatch = useAppDispatch();
    const nav = useEventNavigation();
    const errors = useAppSelector(s => s.event.errors);
    const inProgress = useAppSelector(s => s.preloader.inProgress);

    const cancel = async () => {
        await dispatch(cancelResultMenu());
        nav.toList();
    };

    return (
        <div className="space-y-3">
            {errors.isError && (
                <Alert variant="destructive">
                    <AlertDescription>
                        {Object.values(errors.current).filter(Boolean).join('. ')}
                    </AlertDescription>
                </Alert>
            )}
            <div className="flex items-center justify-end gap-2">
                <Button variant="outline" onClick={cancel} disabled={inProgress}>
                    Отмена
                </Button>
                <Button
                    className="bg-action text-action-foreground hover:bg-action/90"
                    onClick={() => dispatch(send())}
                    disabled={inProgress}
                >
                    {inProgress ? 'Отправка…' : 'Отправить'}
                </Button>
            </div>
        </div>
    );
};
