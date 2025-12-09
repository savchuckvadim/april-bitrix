import { BXDepartment } from '@workspace/bx';
import { IDepartmentResponse } from './types/report/report-type';

export const getIsUserHead = (
    department: IDepartmentResponse,
    currentUserId: number,
): boolean => {
    let result = false;
    let dallDepartments: BXDepartment[] = []

    if (department.generalDepartment?.length) {
        dallDepartments = [...department.generalDepartment]
    }
    if (department.childrenDepartments?.length) {
        dallDepartments = [
            ...dallDepartments,
            ...department.childrenDepartments,
        ]

    }

    dallDepartments &&
        dallDepartments.length > 0 &&
        dallDepartments.forEach(dep => {
            if (dep.UF_HEAD) {
                if (
                    dep.UF_HEAD == String(currentUserId) ||
                    (Array.isArray(dep.UF_HEAD) &&
                        (dep.UF_HEAD as number[]).includes(currentUserId))
                ) {
                    result = true;
                }
            }
        });
    // if (department.childrenDepartments.length) {
    //     [
    //         ...department.childrenDepartments,
    //         ...department.generalDepartment,
    //     ].forEach(dep => {
    //         if (dep.UF_HEAD) {
    //             if (
    //                 dep.UF_HEAD == String(currentUserId) ||
    //                 (Array.isArray(dep.UF_HEAD) &&
    //                     (dep.UF_HEAD as number[]).includes(currentUserId))
    //             ) {
    //                 result = true;
    //             }
    //         }
    //     });
    // }
    debugger
    return result;
};
