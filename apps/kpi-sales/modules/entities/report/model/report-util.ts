import { BXDepartment, BXUser } from '@workspace/bx';
import { IDepartmentResponse } from './types/report/report-type';

const isFilled = (value: string | undefined | null): boolean =>
    Boolean(value && String(value).trim().length > 0);

export const normalizeUserName = (user: BXUser): BXUser => {
    if (isFilled(user.NAME) && isFilled(user.LAST_NAME)) {
        return user;
    }

    const fallback = isFilled(user.EMAIL)
        ? { NAME: `Сотрудник ${user.ID}`, LAST_NAME: user.EMAIL }
        : { NAME: 'Сотрудник', LAST_NAME: String(user.ID) };

    return {
        ...user,
        NAME: isFilled(user.NAME) ? user.NAME : fallback.NAME,
        LAST_NAME: isFilled(user.LAST_NAME)
            ? user.LAST_NAME
            : fallback.LAST_NAME,
    };
};

const normalizeDepartmentUsers = (dep: BXDepartment): BXDepartment => ({
    ...dep,
    USERS: dep.USERS ? dep.USERS.map(normalizeUserName) : dep.USERS,
});

export const normalizeDepartmentResponse = (
    department: IDepartmentResponse,
): IDepartmentResponse => ({
    ...department,
    allUsers: department.allUsers
        ? department.allUsers.map(normalizeUserName)
        : department.allUsers,
    generalDepartment: department.generalDepartment
        ? department.generalDepartment.map(normalizeDepartmentUsers)
        : department.generalDepartment,
    childrenDepartments: department.childrenDepartments
        ? department.childrenDepartments.map(normalizeDepartmentUsers)
        : department.childrenDepartments,
});

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

    return result;
};
