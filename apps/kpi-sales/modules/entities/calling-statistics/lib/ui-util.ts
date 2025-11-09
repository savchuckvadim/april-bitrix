import { ReportCallingData } from '../type/calling-type';
import { RTableProps } from '@/modules/shared';

export const getCallingStatisticsTableData = (
    data: ReportCallingData[],
): RTableProps => {

    return {
        code: 'calling-statistics',
        firstCellName: 'Менеджер',
        data: data.map(item => ({
            id: Number(item.user.ID),
            name: `${item?.user?.NAME || ''} ${item?.user?.LAST_NAME || ''}` || item.userName || 'Менеджер',
            actions: item.callings.map(calling => ({
                name: calling.action || '%',
                value: calling.count,
            })),
        })),
    };
};
