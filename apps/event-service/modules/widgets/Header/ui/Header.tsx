import { FC } from 'react';
import { Button } from '@workspace/ui/components/button';
import { useAppDispatch } from '@/modules/app/lib/hooks/redux';
import { send } from '@/modules/processes/event';

export const Header: FC = () => {
    const dispatch = useAppDispatch();
    const sendEvent = () => {
        dispatch(send());
    };

    return (
        <div className="sticky top-0 z-40 w-full border-b border-border bg-background px-4 py-2">
            <div className="flex items-center justify-end gap-2">
                <Button size="sm" onClick={sendEvent}>
                    Отправить
                </Button>
                <Button size="sm" variant="outline">
                    Отмена
                </Button>
            </div>
        </div>
    );
};
