import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { FC } from 'react';
import CheckBox from './CheckBox';
import { EVServiceSignalState } from '@/modules/features/ServiceSiganal/model/ServiceSignalSlice';
import CheckListHeader from '../CheckListHeader/CheckListHeader';
import Mark from '../Mark/Mark';
import { BBCodeRenderer } from '@/modules/shared/BBCode';
import { ServiceSignalReportProps } from '../ServiceSignalReport';

const CheckList: FC<ServiceSignalReportProps> = ({ type = 'info' }) => {
    const ss = useAppSelector(state => state.serviceSignal) as EVServiceSignalState;
    const currentTask = useAppSelector(state => state.eventTask.current);

    const checkLists = ss.checklists;

    return (
        <div className="flex w-full flex-col gap-2">
            {currentTask &&
                currentTask.description &&
                (type === 'info' || type === 'all') && (
                    <div className="rounded-lg bg-muted/50 p-3 text-sm text-foreground">
                        <BBCodeRenderer text={currentTask.description} />
                    </div>
                )}
            {(type === 'checkList' || type === 'all') && (
                <div className="flex flex-col gap-3">
                    <Mark />
                    {checkLists &&
                        checkLists.length > 0 &&
                        checkLists.map(list => (
                            <div
                                key={`ss-checklist-${list.ID}`}
                                className="rounded-lg border border-border p-2"
                            >
                                <CheckListHeader checkList={list} />
                                {list.checkboxes.map(checkbox => (
                                    <CheckBox
                                        key={`ss-checkbox-${list.ID}--${checkbox.ID}`}
                                        checkbox={checkbox}
                                        onCheck={() => {}}
                                    />
                                ))}
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
};

export default CheckList;
