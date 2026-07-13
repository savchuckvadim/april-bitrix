import { FC, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    PresentationCountProp,
    PresentationProp,
    PresentationStateCount,
    eventPresentationActions,
} from '../model/PresSlice';
import { EVCard, ABadge } from '@workspace/april-ui';

export const Presentation: FC = () => {
    const presentationState = useAppSelector(state => state.eventPresentation);
    const isPresentationDone = presentationState[PresentationProp.IS_PRESENTATION_DONE];
    const currentTask = useAppSelector(state => state.eventTask.current);
    const isCurrentReportPresentation = currentTask?.eventType == 'presentation';

    const [presentstion, setPresentation] = useState<PresentationStateCount | null>(
        currentTask?.presentation ?? null,
    );

    const dispatch = useAppDispatch();
    const actions = eventPresentationActions;
    const setPresProp = (name: PresentationProp, value: boolean) => {
        if (!isCurrentReportPresentation) {
            dispatch(actions.setPresentationProp({ name, value }));
        }
    };

    useEffect(() => {
        setPresentation(currentTask?.presentation ?? null);
    }, [currentTask]);

    return (
        <EVCard title={'Презентации'} width={12}>
            <div className="w-full p-0">
                {presentstion && (
                    <div className="flex flex-row items-start justify-start gap-4">
                        <p className="m-0 flex items-center text-sm">
                            По компании:{' '}
                            <span className="ms-1 font-semibold text-primary">
                                {presentstion[PresentationCountProp.COMPANY]}
                            </span>
                        </p>
                        <p className="m-0 flex items-center text-sm">
                            Текущие:{' '}
                            <span className="ms-1 font-semibold text-primary">
                                {presentstion[PresentationCountProp.DEAL]}
                            </span>
                        </p>
                    </div>
                )}

                <div className="mt-1 flex flex-col items-start justify-start">
                    <label className="mb-1 text-sm text-muted-foreground">
                        Зафиксировать презентацию
                    </label>
                    <div className="flex items-center gap-2">
                        <ABadge
                            title={'Была проведена'}
                            color={isPresentationDone ? 'success' : 'light'}
                            isActive={isPresentationDone}
                            isIconeDone={true}
                            clickHendler={() =>
                                setPresProp(PresentationProp.IS_PRESENTATION_DONE, !isPresentationDone)
                            }
                        />
                        {isPresentationDone && (
                            <div className="text-xs font-semibold text-chart-2">+1</div>
                        )}
                    </div>
                </div>
            </div>
        </EVCard>
    );
};
