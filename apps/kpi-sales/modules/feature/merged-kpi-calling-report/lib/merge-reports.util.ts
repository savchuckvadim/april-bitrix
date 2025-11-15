import { ReportCallingData } from "@/modules/entities/calling-statistics";

import { ReportData } from "@/modules/entities/report/model/types/report/report-type";
import { RTableProps } from "@/modules/shared";
import { DownloadKpiReportItemDto, DownloadReportKpiItemDto } from "@workspace/nest-api";

export const getMergedReportsData = (report: RTableProps, callingsReport: RTableProps): RTableProps => {
    const data: RTableProps['data'] = [];


    callingsReport.data.forEach(callingUserReport => {
        const result: RTableProps['data'][0] = {
            ...callingUserReport,
        };

        report.data.forEach(kpiUserReport => {

            if (Number(kpiUserReport.id) === Number(callingUserReport.id)) {

                result.actions.push(...kpiUserReport.actions.filter(action =>
                    getIsFiltredKpiReportForMergedReport(action.name) &&
                    !result.actions.some(a => a.name === action.name)

                ));

            }
        });
        data.push(result);
    });



    //TODO привести все оттчет сгруппированные по юзерам к одному набору actions - по самому длинному
    const longestReport = data.reduce((prev, curr) => {
        return (curr.actions?.length || 0) > (prev?.actions?.length || 0) ? curr : prev;
    }, data[0]);
    const preparedData = data.map(item => {
        const actions = longestReport?.actions.map(action => {
            const searchedCurrentAction = item.actions.find(item => item.name === action.name);
            if (searchedCurrentAction) {
                return searchedCurrentAction;
            }
            return {
                ...action,
                value: 0,
                count: 0,
            };
        }) || [];
        return {
            ...item,
            actions,
        };
    });

    return {
        code: report.code,
        firstCellName: report.firstCellName,
        data: preparedData,
    };
}


export const getKpidReportsExcelData = (reportData: ReportData[],): DownloadKpiReportItemDto[] => {
    const result: DownloadKpiReportItemDto[] = reportData.map(userKpiReport => (
        getDownloadReportFromKpiReport(userKpiReport)
    ));

    return result;
}

export const getMergedReportsExcelData = (reportData: ReportData[], callingsReportData: ReportCallingData[], selectedUsers: number[], selectedActions: string[]): DownloadKpiReportItemDto[] => {

    //todo selected actions
    // const report = getReportTableData(reportData);
    // const callingsReport = getCallingStatisticsTableData(callingsReportData);
    const reportDataFiltredByUsers = reportData.filter(user => selectedUsers.includes(user.id));
    const reportDataFiltredByActions = reportDataFiltredByUsers.map(user => ({
        ...user,
        kpi: user.kpi.filter(kpi => selectedActions.includes(kpi.action?.name || '')),
    }));
    const callingsReportDataFiltredByUsers = callingsReportData.filter(user => selectedUsers.includes(Number(user?.user?.ID || 0)));
    const callingsReportDataFiltredByActions = callingsReportDataFiltredByUsers.map(user => ({
        ...user,
        callings: user.callings.filter(calling => selectedActions.includes(calling.action as string)),
    }));


    const result: DownloadKpiReportItemDto[] = reportDataFiltredByActions.map(userKpiReport => (
        getDownloadReportFromKpiReport(userKpiReport)
    ));
    const filtredKpiResult: DownloadKpiReportItemDto[] = result.map(item => {
        return {
            ...item,
            kpi: item.kpi.filter(kpi => getIsFiltredKpiReportForMergedReport(kpi.action)),
        } as DownloadKpiReportItemDto;
    }) as DownloadKpiReportItemDto[];



    callingsReportDataFiltredByActions.forEach(callingUserReport => {

        filtredKpiResult.forEach(item => {
            const callingReportItem = getDownloadReportFromCallingReport(callingUserReport);

            if (Number(item.id) === Number(callingReportItem.id)) {

                item.kpi.unshift(...callingReportItem.kpi);

            }
        });
    });
    return filtredKpiResult;


    // return getMergedReportsData(report, callingsReport);
}


const getDownloadReportFromKpiReport = (kpiReport: ReportData): DownloadKpiReportItemDto => {
    return {
        id: Number(kpiReport.id),
        userName: kpiReport.userName || '',
        kpi: kpiReport.kpi.map(kpi => {
            return {
                id: String(kpi.id),
                action: kpi.action.name,
                count: kpi.count || 0,
            } as DownloadReportKpiItemDto;
        }),
    } as DownloadKpiReportItemDto;
}

const getDownloadReportFromCallingReport = (callingReport: ReportCallingData): DownloadKpiReportItemDto => {
    return {
        id: Number(callingReport.user.ID),
        userName: callingReport.userName || '',
        kpi: callingReport.callings.map(calling => {
            return {
                id: String(calling.id),
                action: calling.action as string,
                count: calling.count || 0,
            } as DownloadReportKpiItemDto;
        }),
    } as DownloadKpiReportItemDto;
}


const getIsFiltredKpiReportForMergedReport = (actionName: string): boolean => {
    return actionName !== 'План' &&
        actionName !== 'Результативные' &&
        !actionName.toLowerCase().includes('звонок');
}
