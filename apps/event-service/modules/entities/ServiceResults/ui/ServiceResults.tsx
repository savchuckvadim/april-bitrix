import { FC } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import Action from './components/Action';
import { ServiceResultsState } from '../model/ServiceResultsSlice';
import { setCurrentServiceResult } from '../model/ServiceResultsThunk';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { useTask } from '@/modules/entities/EventServiceTask';
import { SERVICE_EVENT_CATALOG } from '../lib/service-event-catalog';

export const ServiceResults: FC = () => {
    const results = useAppSelector(state => state.serviceResults);

    const dispatch = useAppDispatch();
    const set = (name: keyof ServiceResultsState) => {
        dispatch(setCurrentServiceResult(name));
    };

    const { isSS } = useTask();

    return (
        <SectionCard title={'Результаты'} density="compact">
            <div className="w-full p-0" style={isSS ? { height: '20px' } : undefined}>
                <div className="flex max-w-full flex-wrap items-center gap-x-2 gap-y-1">
                    {SERVICE_EVENT_CATALOG.map(item => (
                        <Action
                            key={item.code}
                            actionName={item.name}
                            isDone={results[item.code]}
                            setIsDone={() => set(item.code)}
                            type={item.code}
                        />
                    ))}
                </div>
            </div>
        </SectionCard>
    );
};
