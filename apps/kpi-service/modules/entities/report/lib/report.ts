


import { IBXUser } from '@workspace/bitrix/src/domain/interfaces/bitrix.interface';
import { KPIOrk, OrkKpiFilter, OrkKpiFilterInnerCode, OrkReportKpiData } from '@workspace/nest-api';
// import { Filter, FilterInnerCode, Kpi, ReportData } from '@workspace/nest-api';

export const getFiltredrReport = (
    report: OrkReportKpiData[],
    department: IBXUser[],
    actions: OrkKpiFilter[],
    filter: OrkKpiFilterInnerCode[],
): OrkReportKpiData[] => {
    let resultRep = getSpreadReport(report).filter(rep =>
        department.some(user => Number(user.ID) === Number(rep.user.ID)),
    ) as Array<OrkReportKpiData>;

    for (const key in resultRep) {
        const filtredKPI = [] as Array<KPIOrk>;
        resultRep?.[key]?.kpi?.forEach(kpi => {
            if (
                actions.some(
                    actionKpi => actionKpi.innerCode === kpi.action.innerCode,
                ) &&
                filter.some(filterCode => filterCode === kpi.action.innerCode)
            ) {
                filtredKPI.push(kpi);
            }
        });

        if (resultRep[key]) {
            resultRep[key].kpi = filtredKPI;
        }
    }

    return resultRep;
};

export const getSpreadReport = (
    report: Array<OrkReportKpiData>,
): Array<OrkReportKpiData> => {
    return report.map(report => ({
        ...report,
        kpi: report.kpi.map((kpi: KPIOrk) => ({ ...kpi })),
    }));
};
// export const getFiltredCallReport = (
//     report: Array<ReportCallingData>,
//     department: Array<BitrixUser>,

// ): Array<ReportData> => {

//     let resultRep = report.filter(rep => department.some(user => user.ID === rep.user.ID)) as Array<ReportData>

//     return resultRep
// }

export const getTotalData = (report: OrkReportKpiData[]): KPIOrk[] => {
    const totalKPI = [] as KPIOrk[];
    report.forEach(urep => {
        urep.kpi.forEach(kpi => {
            const totalItem = totalKPI.find(
                (item: KPIOrk) => item.id === kpi.id,
            ) as KPIOrk | undefined;
            if (totalItem) {
                totalItem.count += kpi.count;
            } else {
                totalKPI.push({ ...kpi });
            }
        });
    });
    return totalKPI;
};

export const getMediumData = (
    report: OrkReportKpiData[],
    currentKPI: KPIOrk[],
): KPIOrk[] => {
    const mediumKPI = [] as KPIOrk[];

    currentKPI.forEach(kpi => {
        mediumKPI.push({
            ...kpi,
            count: Number((kpi.count / report.length).toFixed(0)),
        });
    });
    return mediumKPI;
};
