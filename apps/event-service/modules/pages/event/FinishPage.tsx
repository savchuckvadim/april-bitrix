import { FC } from 'react';
import { Page, AButton } from '@workspace/april-ui';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { bxRedirect } from '@/modules/processes/event/model/EventThunk';
import { Preloader } from '@/modules/shared/Preloader';
import { APP_DISPLAY_MODE } from '@/modules/app/types/app/app-type';
import { reloadApp } from '@/modules/app/';

const FinishPage: FC = () => {
    const dispatch = useAppDispatch();

    const redirect = (to: 'deal' | 'company' | 'tasks') => dispatch(bxRedirect(to));
    const display = useAppSelector(state => state.app.display.mode);
    const isCallCard = display === APP_DISPLAY_MODE.CALL_CARD;
    const reload = () => dispatch(reloadApp());

    return (
        <Page color="grey">
            <div className="flex w-full flex-col items-center justify-center p-4">
                {!isCallCard ? (
                    <div className="mt-2 flex w-full max-w-md flex-col gap-2">
                        <AButton title="к сделкам" align="center" color="blue" size="big" clickHendler={() => redirect('deal')} isActive />
                        <AButton title="к компаниям" align="center" color="blue" size="big" clickHendler={() => redirect('company')} isActive />
                        <AButton title="к задачам" align="center" color="blue" size="big" clickHendler={() => redirect('tasks')} isActive />
                        <AButton title="+ создать" align="center" color="blue" size="big" clickHendler={reload} isActive />
                    </div>
                ) : (
                    <Preloader phrase="Исполнено" />
                )}
            </div>
        </Page>
    );
};

export default FinishPage;
