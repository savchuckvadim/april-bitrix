import { useAppDispatch } from '@/modules/app/lib/hooks/redux';
import { getCompletedCheckList } from '@/modules/features/ServiceSiganal/lib/event-ss-util';
import { EV_SS_CheckList } from '@/modules/features/ServiceSiganal/type/event-ss-type';
import { ABadge, ATogglerColor } from '@workspace/april-ui';
import { FC } from 'react';
import { getDoneAllcheckBoxes } from '@/modules/features/ServiceSiganal/model/ServiceSignalThunk';

export interface CheckListHeaderProps {
    checkList: EV_SS_CheckList;
}

const CheckListHeader: FC<CheckListHeaderProps> = ({ checkList }) => {
    const completed = getCompletedCheckList(checkList);
    const total = checkList.checkboxes.length;
    const percent = `${((completed / total) * 100).toFixed(0)}%`;
    const isNeedTodone = total - completed !== 0;

    const dispatch = useAppDispatch();
    const doneAll = () => dispatch(getDoneAllcheckBoxes(checkList));

    return (
        <div className="flex items-center justify-between gap-2">
            <div className="flex-1">
                <ATogglerColor
                    key={`ss-header-progress-${checkList.ID}`}
                    total={checkList.checkboxes.length + 1}
                    palit={['bxblue', 'bxblue', 'bxblue', 'bxblue', 'bxblue', 'bxblue', 'bxblue', 'bxblue', 'bxblue', 'bxblue']}
                    innerValue={`Выполнено: ${percent}`}
                    order={completed}
                    title={'Чек-лист ' + checkList.TITLE}
                    onClick={() => {}}
                    size="small"
                />
            </div>

            <div className="shrink-0">
                <ABadge
                    isActive={!isNeedTodone}
                    size="xsmall"
                    title={isNeedTodone ? 'сделать все' : 'все сделано'}
                    color="april"
                    clickHendler={doneAll}
                />
            </div>
        </div>
    );
};

export default CheckListHeader;
