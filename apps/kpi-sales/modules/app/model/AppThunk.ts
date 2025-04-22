import type { BXUser } from "@workspace/bx";
import { bxAPI as bx } from "@workspace/api";
import { TESTING_DOMAIN, TESTING_USER } from "../consts/app-global";
import { appActions } from "./AppSlice";
import { AppDispatch, AppGetState } from "./store";


export const initial = (inBitrix: boolean = false) =>
  async (dispatch: AppDispatch, getState: AppGetState) => {


    const state = getState();
    const app = state.app;
    const isLoading = app.isLoading
    const __IN_BITRIX__ = inBitrix


    if (!isLoading) {
      dispatch(
        appActions.loading({ status: true })
      )

      const domain: string = __IN_BITRIX__ ? (await bx.getDomain()) || TESTING_DOMAIN : TESTING_DOMAIN;

      const user = __IN_BITRIX__ ? ((await bx.getCurrentUser()) as BXUser) : TESTING_USER;
      console.log("user");

      console.log(user);
      console.log("user");

      console.log(user);

      dispatch(
        appActions.
          setAppData(
            {
              domain,
              user,


            }
          ))

      dispatch(
        appActions.loading({ status: false })
      )
      // dispatch(departmentAPI.endpoints.getDepartment.initiate({ domain }));




    }

  };

export const reloadApp = () => async (dispatch: AppDispatch, getState: AppGetState) => {


  setTimeout(() => {


    dispatch(
      // initialEventApp()
      appActions.reload()
    )


  }, 1000)

}