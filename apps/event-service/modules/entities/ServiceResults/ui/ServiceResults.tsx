import { FC } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { PresentationStateCount } from '../../EventPresentation/model/PresSlice';
import Action from './components/Action';
import { ServiceResultsState } from '../model/ServiceResultsSlice';
import { EV_SERVICE_PLAN_CODE, EV_SERVICE_PLAN_NAME } from '@/modules/entities/EventPlan/type/event-plan-service-type';
import { setCurrentServiceResult } from '../model/ServiceResultsThunk';
import { EVCard } from '@workspace/april-ui';
import { useTask } from '@/modules/entities/EventServiceTask';

export const ServiceResults: FC = () => {
    const presentstion = useAppSelector(state => state.serviceResults[EV_SERVICE_PLAN_CODE.PRESENTATION]);
    const edu = useAppSelector(state => state.serviceResults[EV_SERVICE_PLAN_CODE.LEARNING]);
    const eduFirst = useAppSelector(state => state.serviceResults[EV_SERVICE_PLAN_CODE.LEARNING_FIRST]);
    const ss = useAppSelector(state => state.serviceResults[EV_SERVICE_PLAN_CODE.SS]);

    const dispatch = useAppDispatch();
    const set = (name: keyof ServiceResultsState) => {
        dispatch(setCurrentServiceResult(name));
    };

    const { isSS } = useTask();

    return (
        <EVCard title={'Результаты'} width={12} size={'smallest'}>
            <div className="w-full p-0" style={{ height: isSS ? '20px' : '100%' }}>
                <div className="flex flex-wrap items-center gap-2">
                    <Action
                        actionName={EV_SERVICE_PLAN_NAME.PRESENTATION}
                        isDone={presentstion}
                        setIsDone={() => set(EV_SERVICE_PLAN_CODE.PRESENTATION)}
                        type={EV_SERVICE_PLAN_CODE.PRESENTATION}
                    />
                    <Action
                        actionName={EV_SERVICE_PLAN_NAME.LEARNING}
                        isDone={edu}
                        setIsDone={() => set(EV_SERVICE_PLAN_CODE.LEARNING)}
                        type={EV_SERVICE_PLAN_CODE.LEARNING}
                    />
                    <Action
                        actionName={EV_SERVICE_PLAN_NAME.LEARNING_FIRST}
                        isDone={eduFirst}
                        setIsDone={() => set(EV_SERVICE_PLAN_CODE.LEARNING_FIRST)}
                        type={EV_SERVICE_PLAN_CODE.LEARNING_FIRST}
                    />
                    <Action
                        actionName={EV_SERVICE_PLAN_NAME.SS}
                        isDone={ss}
                        setIsDone={() => set(EV_SERVICE_PLAN_CODE.SS)}
                        type={EV_SERVICE_PLAN_CODE.SS}
                    />
                </div>
            </div>
        </EVCard>
    );
};
