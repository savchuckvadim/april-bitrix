import { AppDispatch, AppGetState } from "@/modules/app/model/store";
import { departmentActions } from "./DepartmentSlice";
import { BXSDepartment, DEPARTAMENT_STATE_PROP, DUSER_ROLE } from "../type/department-type";

import { getModeByUser } from "../utils/department-util";
import { getDepartmentFromLocalStorage, saveDepartmentToLocalStorage } from "../api/local-api";
import type { BXUser } from "@workspace/bx";
import { evs, local as localAPI, hook as hookAPI, API_METHOD } from "@workspace/api";

interface DepartmentSessionResponse {
  allUsers: Array<BXUser>;
  childrenDepartments: Array<BXSDepartment>;
  generalDepartment: Array<BXSDepartment>;
}

export const getDepartment =
  (domain: string, currentUser: BXUser) => async (dispatch: AppDispatch, getState: AppGetState) => {
    // dispatch(setPreloader(true))

    const state = getState();
    // const domain = state.app.domain || TESTING_DOMAIN //state.app.domain
    // const currentUser = state.app.bitrix.user //state.app.currentUser

    const placement = state.event.placement;

    // let departament = null as null | Array<BXUser>

    const departamentData = { domain };

    // const key = getDepartmentKey();
    let department = getDepartmentFromLocalStorage(domain) as null | Array<BXUser>;
    // departament = await onlineGeneralAPI
    //     .service(
    //         'bitrix/departament',
    //         'post', 'departament',
    //         departamentData
    //     ) as Array<BXUser> | null
    // console.log('department')
    // console.log(department)

    if (!department) {
      const departamentResponse = (await hookAPI.service(
        "full/department",
        API_METHOD.POST,
        "department",
        departamentData
      )) as DepartmentSessionResponse | null;

      if (departamentResponse) {
        department = departamentResponse.allUsers as Array<BXUser>;

        saveDepartmentToLocalStorage(department, domain);
      }
    }
    // console.log('department after state')
    // console.log(department)
    dispatch(
      departmentActions.setFetchedDepartament({
        domain,
        // placement,
        department,
        currentUser,
      })
    );
  };

export const setCurrentUser =
  (
    from: DEPARTAMENT_STATE_PROP.PLAN | DEPARTAMENT_STATE_PROP.REPORT,
    role: DUSER_ROLE,
    userId: number
  ) =>
  async (dispatch: AppDispatch, getState: AppGetState) => {
    const state = getState();
    const responsibilities =
      state.department[DEPARTAMENT_STATE_PROP.DEPARTAMENT][DUSER_ROLE.RESPONSIBLE].items;
    const current = responsibilities.find((user: BXUser) => user.ID == userId);

    if (current) {
      dispatch(
        departmentActions.setCurrentUser({
          from,
          role,
          value: current,
        })
      );
    }
  };

export const setDepartmentMode =
  (user: BXUser) => async (dispatch: AppDispatch, getState: AppGetState) => {
    const currentDepartmentMode = await localAPI.getParsedData("currentDepartmentMode");
    let isSetFromLocal = false;
    let departmentModeCode;
    if (currentDepartmentMode) {
      if (currentDepartmentMode.code) {
        departmentModeCode = currentDepartmentMode.code;
      }
    }
    if (!departmentModeCode && user) {
      departmentModeCode = getModeByUser(user);
    }

    if (departmentModeCode) {
      dispatch(departmentActions.setMode({ code: departmentModeCode }));
    }
  };
