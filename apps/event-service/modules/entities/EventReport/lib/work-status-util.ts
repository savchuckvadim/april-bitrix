import { DepartmentModeStateItemCode } from "@/modules/features/Departament/type/department-type";
import { EV_REPORT_PROP, EventReportSelectItem, EventReportStateReport } from "../type/event-report-type";


export const getCurrentWorkStatusItems = (
    report: EventReportStateReport,
    departmentMode: DepartmentModeStateItemCode
): Array<EventReportSelectItem> => {


    const isTmc = departmentMode === 'tmc'
    const isSetAside = report[EV_REPORT_PROP.WORK_STATUS].items.find(wsitem => wsitem.code == 'setAside' && wsitem.isActive)
    let workStatusItems = report[EV_REPORT_PROP.WORK_STATUS].items as Array<EventReportSelectItem>
    const workStatusCurrentCode = report[EV_REPORT_PROP.WORK_STATUS].current.code

    if (isTmc) {
        workStatusItems = report[EV_REPORT_PROP.WORK_STATUS].items.filter(wsitem => wsitem.code !== 'success')

    }
    workStatusItems = workStatusItems.filter(wsItem => {
        const isActive = wsItem.code == workStatusCurrentCode
        // Проверяем, если выбран 'setAside' и текущий элемент активный
        if (workStatusCurrentCode === 'setAside' && isActive) {
            return wsItem.code !== 'inJob';
        }

        // Проверяем, если выбран 'inJob' и текущий элемент активный
        if (workStatusCurrentCode === 'inJob' && isActive) {
            return wsItem.code !== 'setAside';
        }

        // Для всех остальных случаев показываем 'inJob' и все остальные элементы
        return wsItem.code !== 'setAside';

    })

    return workStatusItems

}

export const getCurrentWorkStatusItemsFromDepartment = (
    report: EventReportStateReport,
    departmentMode: DepartmentModeStateItemCode
): Array<EventReportSelectItem> => {


    const isTmc = departmentMode === 'tmc'
    let workStatusItems = report[EV_REPORT_PROP.WORK_STATUS].items as Array<EventReportSelectItem>

    if (isTmc) {
        workStatusItems = report[EV_REPORT_PROP.WORK_STATUS].items.filter(wsitem => wsitem.code !== 'success')

    }
    
    return workStatusItems

}