import { FC, useState } from "react";
import { useReport } from "../../model";
import { ChartTotal } from "@/modules/widgetes"
import { formatPeriod, getColors } from "@/modules/entities/report/lib/colors";
import { ChartTotalData } from "@/modules/widgetes/chart/ui/Chart";
import { useAppSelector } from "@/modules/app/lib/hooks/redux";
import { ReportDateType } from "../../model/types/report/report-type";

const KPITotal: FC = () => {
    const { report, totalKPI, mediumKPI } = useReport()
    const colors = getColors(totalKPI)
    const totalKPIChartData = totalKPI.map((kpi, i) => ({
        name: kpi.action.name,
        value: kpi.count,
        color: colors[i]
    } as ChartTotalData))

    const mediumKPIChartData = mediumKPI.map((kpi, i) => ({
        name: kpi.action.name,
        value: kpi.count,
        color: colors[i]
    } as ChartTotalData))
    const date = useAppSelector(state => state.report.date)

    const period = formatPeriod(date[ReportDateType.FROM], date[ReportDateType.TO])

    return <div className="flex flex-wrap gap-4 mt-5">
        <div className="w-full md:w-[calc(50%-0.5rem)]">
            <ChartTotal
                title="Итого"
                chartData={totalKPIChartData}
                period={period}
                colors={colors}
            />
        </div>
        <div className="w-full md:w-[calc(50%-0.5rem)]">
            <ChartTotal
                title="Усредненные показатели"
                chartData={mediumKPIChartData}
                period={period}
                colors={colors}
            />
        </div>
    </div>

}


export default KPITotal