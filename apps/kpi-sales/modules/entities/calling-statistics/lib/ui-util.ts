import { ReportCallingData } from "../type/calling-type"
import { RTableProps } from "@/modules/shared"


export const getCallingStatisticsTableData = (data: ReportCallingData[]): RTableProps => {
    return {
        code: 'calling-statistics',
        firstCellName: 'Менеджер',
        data: data.map((item) => ({
            name: item.userName || 'Менеджер',
            actions: item.callings.map((calling) => ({
                name: calling.action || '%',
                value: calling.count
            }))
        }))
    }
}
