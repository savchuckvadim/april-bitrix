
import { APP_TYPE } from "@/modules/app/types/app/app-type";
import { routerActions, routerSlice } from "./RouterSlice";
import { AppDispatch, AppGetState } from "@/modules/app/model/store";
import {  ROUTE_DOCUMENT, ROUTE_EVENT, Route, RouteEvent } from "../types/router-type";
import { eventRouterActions } from "@/modules/processes/event";



// export const fetchUsers = () => async (dispatch: AppDispatch, GetState: AppStore) => {

//     try {
//         dispatch(userSlice.actions.usersFetching())
//         const response = await axios.get<IUser[]>(
//             'https://jsonplaceholder.typicode.com/users'
//         )
//         dispatch(userSlice.actions.usersFetchingSuccess(response.data))
//     } catch (error) {
//         dispatch(userSlice.actions.usersFetchingSuccess(error.message))
//     }

// }
export const setInitialRoute = (
    appType: APP_TYPE, 
    isHaveDeal: boolean
) => (
    dispatch: AppDispatch, 
    GetState: AppGetState
) => {

    const state = GetState()

    // const generalRow = state.rows.sets.general[0]
    switch (appType) {

        case APP_TYPE.DOCUMENT:

        dispatch(
            navigate(
                appType,
                ROUTE_DOCUMENT.COMPLECT_SETTINGS)
           ) 
            break;

        case APP_TYPE.EVENT:
           dispatch(
            navigate(
                appType,
                ROUTE_EVENT.LIST)
           ) 
            break;

        default:
            break;
    }

}

export const navigate = (process: APP_TYPE, route: 
    ROUTE_EVENT | ROUTE_DOCUMENT
) => (
    dispatch: AppDispatch, getState: AppGetState
) => {
    
    const state = getState()
    const eventRoutes = state.eventRouter.routes
    const documentRoutes = state.eventRouter.routes
    // const currentProcess = state.router.current  as APP_TYPE
   dispatch(
    routerActions.setCurrentProcess({name: process})

   )
   
    switch (process) {
        case APP_TYPE.EVENT:
            const currentRouteEvent = route as ROUTE_EVENT
            dispatch(
                eventRouterActions
                .setCurrentRoute({
                    route: currentRouteEvent
                })
            ) 
            break;

            case APP_TYPE.DOCUMENT:
                const currentRouteDocument = route as ROUTE_DOCUMENT
              
                // dispatch(
                //     documentRouterActions
                //     .setCurrentRoute({
                //         route: currentRouteDocument
                //     })
                // ) 
            break;
        
    
            default:
            break;
    }
}




// export const back = () => (
//     dispatch: AppDispatch, getState: AppGetState
// ) => {
//     const state = getState()
//     const routes = state.router.routes as Array<Route>
//     let current = state.router.current as null | Route
//     let previous = state.router.previous as null | Route
//     let newCurrentRoute = null as null | undefined | Route
//     let newRoute = null as null | ROUTE
//     if (current) {
//         switch (current?.route) {

//             case ROUTE.KONSTRUCTOR:
//                 newRoute = ROUTE.GLOBAL
//                 break;

//             case ROUTE.PRODUCTS:
//                 newRoute = ROUTE.KONSTRUCTOR
//                 break;
//             // case ROUTE.DOCUMENT:
//             //     dispatch(clearCurrentTemplate())
//             //     newRoute = ROUTE.PRODUCTS
//             //     break;

//             case ROUTE.REPORT:
//                 newRoute = ROUTE.REPORT
//                 break;
//             case ROUTE.CALLING:
//                 newRoute = ROUTE.CALLING
//                 break;

//              case ROUTE.GLOBAL:
//                  newRoute = ROUTE.KONSTRUCTOR
//                  if(state.router.previous){
//                     newRoute = state.router.previous.route
//                  }
//                  break;

//             default:
//                 break;
//         }
//     }

//     if (newRoute) {
//         newCurrentRoute = routes.find(r => r.route === newRoute)
//     }

//     if (newCurrentRoute) {
//         const routeId = newCurrentRoute.id
//         dispatch(routerSlice.actions.setCurrentRoute({id: routeId}))
//     }
// }
// export const fetchUsers = createAsyncThunk(
//     'user/fetchAll',
//     async (_, thunkAPI) => {
//         try {
//             const response = await axios.get<IUser[]>(
//                 'https://jsonplaceholder.typicode.com/users'
//             )
//             return response.data
//         } catch (error) {
//             return thunkAPI.rejectWithValue('Не удалось загрузить пользователей') 
//         }
      
//     }
// )