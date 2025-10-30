
import { BxDepartmentDataDto, BxDepartmentRequestDto, BxDepartmentRequestDtoDomain, BxDepartmentResponseDto, getBitrixDomainDepartment, } from '@workspace/nest-api/';
import { IDepartmentResponse } from '../../report/model/types/report/report-type';
import { IBXDepartment, IBXUser } from '@workspace/bitrix/src/domain/interfaces/bitrix.interface';


export function updateCurrentGroupsByUsers(
    allGroups: IBXDepartment[],
    currentUsers: IBXUser[],
): IBXDepartment[] {
    const currentUserIds = new Set(currentUsers.map(user => user.ID));

    return allGroups.filter(group => {
        if (!group.USERS || group.USERS.length === 0) {
            return false; // если в группе нет пользователей — не добавляем
        }

        return group.USERS.every(user => currentUserIds.has(user.ID));
    });
}


export async function getDepartmentByDomain(domain: BxDepartmentRequestDtoDomain): Promise<BxDepartmentDataDto | undefined> {
    const departmenttApi = getBitrixDomainDepartment()
    const response = await departmenttApi.departmentGetFullDepartment({
        domain: domain,
        department: 'service'
    } as BxDepartmentRequestDto) as BxDepartmentResponseDto

    debugger
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
    currentUser: IBXUser,
    response: BxDepartmentDataDto,

    filtredDepartmentIds: string[] | null

): {
    users: IBXUser[],
    departament: IBXUser[] | null,
    groups: IBXDepartment[],
    currentGroups: IBXDepartment[],
    currentGroup: IBXDepartment | undefined,
    isHeadManager: boolean,
} {
    let isHeadManager = true;
    let departament: IBXUser[] | null = null;
    const currentUserId = currentUser?.ID;
    const departmentResponse = {
        department: response.department as number,
        generalDepartment: response.generalDepartment as unknown as IBXDepartment[],
        childrenDepartments: response.childrenDepartments as unknown as IBXDepartment[],
        allUsers: response.allUsers as unknown as IBXUser[]
    } as IDepartmentResponse;


    isHeadManager = getIsUserHead(
        departmentResponse,
        Number(currentUserId),
    );

    if (isHeadManager) {
        if (departmentResponse.allUsers) {
            departament = departmentResponse.allUsers.filter(
                (u: IBXUser, index: number, self: IBXUser[]) =>
                    index ===
                    self.findIndex((t: IBXUser) => t.ID === u.ID),
            );
        }
    } else {
        departament = [currentUser];
    }

    const groups = departmentResponse.childrenDepartments.filter(
        (group: IBXDepartment) => getIsTargetGroup(group),
    );
    const currentGroup = groups.find(
        (group: IBXDepartment) =>
            getIsTargetGroup(group) &&
            group.USERS?.find(
                (user: IBXUser) => user.ID == Number(currentUserId),
            ),
    );
    const currentGroups: IBXDepartment[] = currentGroup
        ? [currentGroup]
        : !isHeadManager
            ? []
            : groups;
    const users: IBXUser[] = [];

    if (
        !filtredDepartmentIds ||
        filtredDepartmentIds.length === 0
    ) {
        if (isHeadManager) {
            currentGroups.map((group: IBXDepartment) =>
                group.USERS?.map((usr: IBXUser) => {
                    if (
                        !users.find(
                            (user: IBXUser) => user.ID == usr.ID,
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
        departament?.forEach((user: IBXUser) => {
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

const getIsTargetGroup = (group: IBXDepartment): boolean => {
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
    departament: IBXUser[] | null,
    filtredDepartmentIds: string[] | null,
    isHeadManager: boolean,
    currentGroup: IBXDepartment | undefined,
    users: IBXUser[],
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
        departament = users.map((user: IBXUser) => user);
    }




    return departament
}


export function getDepartamentIds(departament: IBXUser[] | null): number[] {
    const departamentIds: number[] = [];
    if (departament) {
        departament.map((user: IBXUser) => departamentIds.push(Number(user.ID)));
    }
    return departamentIds;
}
