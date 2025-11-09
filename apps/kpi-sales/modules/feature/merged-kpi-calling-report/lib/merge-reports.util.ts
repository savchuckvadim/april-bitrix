import { RTableProps } from "@/modules/shared";

export const getMergedReportsData = (report: RTableProps, callingsReport: RTableProps): RTableProps => {
    const data: RTableProps['data'] = [];


    callingsReport.data.forEach(callingUserReport => {
        const result: RTableProps['data'][0] = {
            ...callingUserReport,
        };

        report.data.forEach(kpiUserReport => {

            if (kpiUserReport.id === callingUserReport.id) {
                debugger
                result.actions.push(...kpiUserReport.actions.filter(action =>
                    action.name !== 'План' &&
                    action.name !== 'Результативные' &&
                    !action.name.toLowerCase().includes('звонок') &&
                    !result.actions.some(a => a.name === action.name)

                ));
                debugger
            }
        });
        data.push(result);
    });

    return {
        code: report.code,
        firstCellName: report.firstCellName,
        data: data,
    };
}
