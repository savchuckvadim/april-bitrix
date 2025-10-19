
import { BXDepartment, BXUser } from '@workspace/bx';
import { BxDepartmentDto, BxDepartmentDtoDomain, DepartmentControllerGetFullDepartment200, DepartmentControllerGetFullDepartment200Department, getBitrix24Department } from '@workspace/nest-api/';
import { IDepartmentResponse } from '../../report/model/types/report/report-type';


export function updateCurrentGroupsByUsers(
    allGroups: BXDepartment[],
    currentUsers: BXUser[],
): BXDepartment[] {
    const currentUserIds = new Set(currentUsers.map(user => user.ID));

    return allGroups.filter(group => {
        if (!group.USERS || group.USERS.length === 0) {
            return false; // если в группе нет пользователей — не добавляем
        }

        return group.USERS.every(user => currentUserIds.has(user.ID));
    });
}


export async function getDepartmentByDomain(domain: BxDepartmentDtoDomain): Promise<DepartmentControllerGetFullDepartment200Department | undefined> {
    const departmenttApi = getBitrix24Department()
    const response = await departmenttApi.departmentGetFullDepartment({
        domain,
        department: 'service'
    } as BxDepartmentDto) as DepartmentControllerGetFullDepartment200


    if (
        !response?.department
    ) {

        return;
    }
    return response.department;
    // return {
    //     department: response.department as number,
    //     generalDepartment: response.department.generalDepartment as unknown as BXDepartment[],
    //     childrenDepartments: response.department.childrenDepartments as unknown as BXDepartment[],
    //     allUsers: response.department.allUsers as unknown as BXUser[]
    // };
}


export function prepareDepartmentResponse(
    currentUser: BXUser,
    response: DepartmentControllerGetFullDepartment200Department,

    filtredDepartmentIds: string[] | null

): {
    users: BXUser[],
    departament: BXUser[] | null,
    groups: BXDepartment[],
    currentGroups: BXDepartment[],
    currentGroup: BXDepartment | undefined,
    isHeadManager: boolean,
} {
    let isHeadManager = true;
    let departament: BXUser[] | null = null;
    const currentUserId = currentUser?.ID;
    const departmentResponse = {
        department: response.department as number,
        generalDepartment: response.generalDepartment as unknown as BXDepartment[],
        childrenDepartments: response.childrenDepartments as unknown as BXDepartment[],
        allUsers: response.allUsers as unknown as BXUser[]
    } as IDepartmentResponse;


    isHeadManager = getIsUserHead(
        departmentResponse,
        currentUserId,
    );

    if (isHeadManager) {
        if (departmentResponse.allUsers) {
            departament = departmentResponse.allUsers.filter(
                (u: BXUser, index: number, self: BXUser[]) =>
                    index ===
                    self.findIndex((t: BXUser) => t.ID === u.ID),
            );
        }
    } else {
        departament = [currentUser];
    }

    const groups = departmentResponse.childrenDepartments.filter(
        (group: BXDepartment) => getIsTargetGroup(group),
    );
    const currentGroup = groups.find(
        (group: BXDepartment) =>
            getIsTargetGroup(group) &&
            group.USERS?.find(
                (user: BXUser) => user.ID == currentUserId,
            ),
    );
    const currentGroups: BXDepartment[] = currentGroup
        ? [currentGroup]
        : !isHeadManager
            ? []
            : groups;
    const users: BXUser[] = [];

    if (
        !filtredDepartmentIds ||
        filtredDepartmentIds.length === 0
    ) {
        if (isHeadManager) {
            currentGroups.map((group: BXDepartment) =>
                group.USERS?.map((usr: BXUser) => {
                    if (
                        !users.find(
                            (user: BXUser) => user.ID == usr.ID,
                        )
                    ) {
                        users.push(usr);
                    }
                }),
            );
        } else {
            users.push(currentUser);
        }
    } else {
        departament?.forEach((user: BXUser) => {
            filtredDepartmentIds.forEach((stringId: string) => {
                const id = Number(stringId);
                if (Number(user.ID) == id) {
                    users.push(user);
                }
            });
        });
    }

    return {
        users,
        departament,
        groups,
        currentGroups,
        currentGroup,
        isHeadManager,
    };

}

const getIsTargetGroup = (group: BXDepartment): boolean => {
    return group.NAME.includes('Группа')
        || group.NAME.includes('Менеджеры ОРК')
        || group.NAME.includes('Обучение');
}

const getIsUserHead = (
    department: IDepartmentResponse,
    currentUserId: number,
): boolean => {
    return true;

    // TODO: remove this
    // let result = false;

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

    // return result;
};


export function getReportInitDepartment(
    departament: BXUser[] | null,
    filtredDepartmentIds: string[] | null,
    isHeadManager: boolean,
    currentGroup: BXDepartment | undefined,
    users: BXUser[],
) {
    if (
        !filtredDepartmentIds ||
        filtredDepartmentIds.length === 0
    ) {
        if (isHeadManager) {
            if (currentGroup && currentGroup.USERS) {
                departament = currentGroup.USERS;
            }
        }
    } else {
        departament = users.map((user: BXUser) => user);
    }




    return departament
}


export function getDepartamentIds(departament: BXUser[] | null): number[] {
    const departamentIds: number[] = [];
    if (departament) {
        departament.map((user: BXUser) => departamentIds.push(user.ID));
    }
    return departamentIds;
}
