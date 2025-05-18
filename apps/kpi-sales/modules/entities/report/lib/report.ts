import { BXUser } from "@workspace/bx"
import { ReportData, KPI } from "../model/types/report/report-type"
import { Filter, FilterInnerCode } from "../model/types/report/report-type"





export const getFiltredrReport = (
    report: ReportData[],
    department: BXUser[],
    actions: Filter[],
    filter: FilterInnerCode[]

): ReportData[] => {

    let resultRep = getSpreadReport(report)
        .filter(rep => department.some(user => Number(user.ID) === Number(rep.user.ID))) as Array<ReportData>


    for (const key in resultRep) {
        const filtredKPI = [] as Array<KPI>
        resultRep?.[key]?.kpi?.forEach(kpi => {

            if (
                actions.some(actionKpi => actionKpi.innerCode === kpi.action.innerCode) &&
                filter.some(filterCode => filterCode === kpi.action.innerCode)
            ) {
                filtredKPI.push(
                    kpi
                )
            }
        })


        if (resultRep[key]) {
            resultRep[key].kpi = filtredKPI;
        }
    }
    debugger
    return resultRep
}

export const getSpreadReport = (
    report: Array<ReportData>,


): Array<ReportData> => {
    return report.map(report => (
        {
            ...report,
            kpi: report.kpi.map((kpi: KPI) => ({ ...kpi }))
        }
    ))
}
// export const getFiltredCallReport = (
//     report: Array<ReportCallingData>,
//     department: Array<BitrixUser>,


// ): Array<ReportData> => {

//     let resultRep = report.filter(rep => department.some(user => user.ID === rep.user.ID)) as Array<ReportData>


//     return resultRep
// }



export const getTotalData = (report: ReportData[]): KPI[] => {
    const totalKPI = [

    ] as KPI[]
    report.forEach(urep => {
        urep.kpi.forEach(kpi => {
            const totalItem = totalKPI.find((item: KPI) => item.id === kpi.id) as KPI | undefined
            if (totalItem) {
                totalItem.count += kpi.count
            } else {
                totalKPI.push({ ...kpi })
            }

        })

    })
    return totalKPI;
}

export const getMediumData = (report: ReportData[], currentKPI: KPI[]): KPI[] => {
    const mediumKPI = [

    ] as KPI[]


    currentKPI.forEach(kpi => {

        mediumKPI.push({
            ...kpi,
            count: Number((kpi.count / report.length).toFixed(0))
        })


    })
    return mediumKPI;
}