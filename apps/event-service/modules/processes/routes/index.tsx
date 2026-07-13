// Custom Redux router UI removed — navigation is driven by Next.js (see processes/event/EventRouter).

//reducer
export { routerReducer, routerActions } from './model/RouterSlice';

//thunk
export {
    setInitialRoute,
    navigate,
    // back,
} from './model/RouterThunk';


//types
// export {
//     RouteItem,
//     ROUTE
// } from './types/router-type';