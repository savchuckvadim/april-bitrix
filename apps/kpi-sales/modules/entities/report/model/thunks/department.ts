// import { departamentAC } from "../../departament/departament-reducer";
// import { BitrixUser } from "@/types/report/report-type";
// import { BXDepartment } from "../report-type";
// import { getIsUserHead } from "../report-util";
// import { hookAPI } from "@/services/april-hook-api";
// import { AppDispatchType } from "@/redux/store";
// import { GetStateType } from "./types";

// export const handleDepartmentData = async (
//     dispatch: AppDispatchType,
//     getState: GetStateType,
//     savedFilterData: any,
//     currentUser: BitrixUser
// ) => {
//     const state = getState();
//     const domain = state.app.domain;
//     const currentUserId = currentUser?.ID;
//     const filtredDepartmentIds = savedFilterData?.department;
//     let departament: BitrixUser[] = [];
//     let users: BitrixUser[] = [];

//     const departamentData = { domain };
//     const departamentResponse = await hookAPI.service('full/department', 'post', 'department', departamentData);
//     const isHeadManager = getIsUserHead(departamentResponse, currentUserId);

//     if (isHeadManager) {
//         if (departamentResponse.allUsers) {
//             departament = departamentResponse.allUsers.filter((u: BitrixUser, index: number, self: BitrixUser[]) =>
//                 index === self.findIndex((t: BitrixUser) => t.ID === u.ID)
//             );
//         }
//         departament = [currentUser];
//     } else {
//         departament = [currentUser];
//     }

//     const groups = departamentResponse.childrenDepartments.filter((group: BXDepartment) => group.NAME.includes('Группа')) as BXDepartment[];
//     const currentGroup = groups.find(group => group.NAME.includes('Группа') && group.USERS?.find(user => user.ID == currentUserId)) as BXDepartment | undefined;
//     const currentGroups = currentGroup ? [currentGroup] : !isHeadManager ? [] : groups as BXDepartment[];

//     if (!filtredDepartmentIds || filtredDepartmentIds.length === 0) {
//         if (isHeadManager) {
//             currentGroups.map(group => group.USERS?.map(usr => {
//                 if (!users.find(user => user.ID == usr.ID)) {
//                     users.push(usr);
//                 }
//             }));
//         } else {
//             users.push(currentUser);
//         }
//     } else {
//         departament?.forEach(user => {
//             filtredDepartmentIds.forEach((stringId: string) => {
//                 const id = Number(stringId);
//                 if (Number(user.ID) == id) {
//                     users.push(user);
//                 }
//             });
//         });
//     }

//     if (departament) {
//         dispatch(departamentAC.setFetchedDepartament(departament, users, groups, currentGroups, isHeadManager));
//     }

//     return {
//         departament: !filtredDepartmentIds || filtredDepartmentIds.length === 0
//             ? isHeadManager && currentGroup && currentGroup.USERS
//                 ? currentGroup.USERS
//                 : users
//             : users,
//         departamentIds: departament.map(user => user.ID)
//     };
// }; 