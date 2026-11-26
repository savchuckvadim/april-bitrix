import React, { FC } from 'react';
import { KPI } from '../../model/types/report/report-type';
import { getColors } from '../../lib/colors';
import { useReport } from '../../model/useReport';
import {
    defaultIndicatorLabeler,
    eventLabelKey,
    type IndicatorLabeler,
} from '@/modules/shared/lib/indicator-labels';

interface ReportInfoProps {
    /** Выводимые названия показателей; по умолчанию — исходные без лишних пробелов. */
    labelOf?: IndicatorLabeler;
}

const ReportInfo: FC<ReportInfoProps> = ({
    labelOf = defaultIndicatorLabeler,
}) => {
    const { totalKPI, mediumKPI } = useReport();
    const colors = getColors(totalKPI);

    return (
        <div className="flex flex-row w-full justify-center">
            <div className="flex flex-row w-3/4 justify-between flex-wrap">
                {/* <p className='text-bold'>Итого</p> */}
                <div className="space-y-2">
                    {totalKPI.map((action, i) => (
                        <ReportInfoItem
                            key={i}
                            action={action}
                            color={colors[i] || ''}
                            i={i}
                            labelOf={labelOf}
                        />
                    ))}
                </div>
                {/* <div className='w-1 h-full bg-gray-200'></div> */}
                {/* <p className='text-bold mt-2'>В среднем</p> */}
                <div className="space-y-2">
                    {mediumKPI.map((action, i) => (
                        <ReportInfoItem
                            key={i}
                            action={action}
                            color={colors[i] || ''}
                            i={i}
                            labelOf={labelOf}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

const ReportInfoItem: FC<{
    action: KPI;
    color: string;
    i: number;
    labelOf: IndicatorLabeler;
}> = ({ action, color, i, labelOf }) => {
    return (
        <div key={i} className="flex items-center text-sm text-foreground">
            <div
                className="w-[30px] h-[11px] mr-3 inline-block"
                style={{ backgroundColor: color }}
            />
            <p>
                –{' '}
                {labelOf(
                    eventLabelKey(action.action.innerCode),
                    action.action.name ?? '',
                )}{' '}
                {action.count}
            </p>
        </div>
    );
};

export default ReportInfo;
