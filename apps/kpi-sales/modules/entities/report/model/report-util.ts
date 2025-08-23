import { IDepartmentResponse } from "./types/report/report-type";

export const getIsUserHead = (
  department: IDepartmentResponse,
  currentUserId: number,
): boolean => {
  let result = false;

  if (department.childrenDepartments.length) {
    [
      ...department.childrenDepartments,
      ...department.generalDepartment,
    ].forEach((dep) => {
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
  }

  return result;
};
