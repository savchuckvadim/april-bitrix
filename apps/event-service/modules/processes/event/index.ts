
// FSD process router — drives the current page through Next.js navigation.
export { EventRouter } from './ui/EventRouter';


//reducer
export { eventReducer, eventActions } from './model/EventSlice';
export { eventRouterReducer, eventRouterActions } from './model/EventRouterSlice';

//thunk
export { initialEventApp, send } from './model/EventThunk';

//type
// export  {
//     EV_TARGET
//   } from "./types/ev-process-type";