
import React, { FC } from 'react';
import { KPI } from '../../model/types/report/report-type';
import { getColors } from '../../lib/colors';
import { useReport } from '../../model/useReport';



const ReportInfo: FC = () => {
    const {


        totalKPI,
        mediumKPI,

    } = useReport()
    const colors = getColors(totalKPI)



    console.log(totalKPI)
    return (
        <div className='flex flex-row w-full justify-center'>
            <div className='flex flex-row w-3/4 justify-between flex-wrap'>
                <div className="space-y-2">
                    {totalKPI.map((action, i) => (
                        <ReportInfoItem key={i} action={action} color={colors[i] || ''} i={i} />
                    ))}
                </div >
                {/* <div className='w-1 h-full bg-gray-200'></div> */}
                <div className="space-y-2">
                    {mediumKPI.map((action, i) => (
                        <ReportInfoItem key={i} action={action} color={colors[i] || ''} i={i} />
                    ))}
                </div >
            </div>
        </div>
    );
}

const ReportInfoItem: FC<{ action: KPI, color: string, i: number }> = ({ action, color, i }) => {
    console.log(color)
    return (
        <div
            key={i}
            className="flex items-center text-sm text-foreground"
        >
            <div
                className="w-[30px] h-[11px] mr-3 inline-block"
                style={{ backgroundColor: color }}
            />
            <p>
                – {action.action.name} {action.count}
            </p>
        </div>
    )
}

export default ReportInfo;