// import { EventReportState } from "../model/EventCompanySlice"
// import { EV_REPORT_PROP, EventReportStateReport } from "../type/event-report-type"

// export const getreportState = (

//     state: EventReportState, propName: EV_REPORT_PROP, value: string

// ): EventReportStateReport => {
//     const result = { ...state.report } as EventReportStateReport
//     if (propName === EV_REPORT_PROP.COMMENT) {
//         result[EV_REPORT_PROP.COMMENT] = value

//     } else {
//         const currentItem = result[propName].items.find(item => item.code == value)
//         if (currentItem) {
//             if (propName === EV_REPORT_PROP.WORK_STATUS) {
//                 // result[propName] = {
//                 //     ...result[propName],
//                 //     current: currentItem


//                 // }
//                 if (value == 'fail') {

//                     result[EV_REPORT_PROP.FAIL_TYPE].isActive = true
//                 } else {

//                     result[EV_REPORT_PROP.FAIL_TYPE].isActive = false
//                     result[EV_REPORT_PROP.FAIL_REASON].isActive = false
//                 }
//             } else if (propName === EV_REPORT_PROP.FAIL_TYPE) {
//                 // result[propName] = {
//                 //     ...result[propName],
//                 //     current: currentItem


//                 // }
//                 if (value == 'failure') {
//                     result[EV_REPORT_PROP.FAIL_REASON].isActive = true

//                 } else {
//                     result[EV_REPORT_PROP.FAIL_REASON].isActive = false

//                 }
//             }
//             result[propName] = {
//                 ...result[propName],
//                 current: currentItem
//             }
//         }
//     }
//     return result
// }

export type CompanyColorType = 'red' | 'green' | 'yellow'
type ColorResult = {
    btnColor: 'success' | 'warning' | 'danger',
    value: number,
    nextColor: CompanyColorType

}
export const getByColor = (color: CompanyColorType): ColorResult => {
    const result = {
        btnColor: '' as 'success' | 'warning' | 'danger',
        value: 0,
        nextColor: 'red' as CompanyColorType,
    } as ColorResult

    if (color == 'red') {
        result.btnColor = 'danger'

        result.value = 35
        result.nextColor = 'yellow'

    } else if (color == 'yellow') {
        result.btnColor = 'warning'
        result.value = 68
        result.nextColor = 'green'

    } else if (color == 'green') {
        result.btnColor = 'success'
        result.value = 99
        result.nextColor = 'red'


    }

    return result
}
