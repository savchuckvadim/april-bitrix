import { EV_PLAN_PROP } from "@/modules/entities/EventPlan/type/event-plan-type";
import { EV_REPORT_PROP } from "@/modules/entities/EventReport/type/event-report-type";
import { EventRoutes, ROUTE_EVENT, ROUTE_EVENT_NAME, RouteEvent } from "@/modules/processes/routes/types/router-type";
import { PayloadAction, createSlice } from "@reduxjs/toolkit"


type EventRouterState = typeof initialState
interface SetCurrenteventRoutePayload {
    route: ROUTE_EVENT
}


const initialState = {
    routes: {
        [ROUTE_EVENT.ITEM]: {
            id: 0,
            name: ROUTE_EVENT_NAME.ITEM,
            route: ROUTE_EVENT.ITEM
        } as RouteEvent,
        [ROUTE_EVENT.LIST]: {
            id: 1,
            name: ROUTE_EVENT_NAME.LIST,
            route: ROUTE_EVENT.LIST
        } as RouteEvent,
        [ROUTE_EVENT.FINISH]: {
            id: 2,
            name: ROUTE_EVENT_NAME.FINISH,
            route: ROUTE_EVENT.FINISH
        } as RouteEvent,
    } as EventRoutes,

    current: {
        id: 0,
        name: ROUTE_EVENT_NAME.LIST,
        route: ROUTE_EVENT.LIST
    } as RouteEvent,
    previous: null as null | RouteEvent,


}

const eventRouterSlice = createSlice({
    name: 'eventRouter',
    initialState,
    reducers: {
        setCurrentRoute(
            state: EventRouterState,
            action: PayloadAction<SetCurrenteventRoutePayload>
        ) {
            const payloadRoute = action.payload.route as ROUTE_EVENT
            
            //@ts-ignore
            const current = state.routes[payloadRoute]

            const previous = state.current as RouteEvent | null
            // const next = state.previous as RouteDocument | null
            if (current) {
                state.current = current
                state.previous = previous
                // state.next = next

            }
        
            
        },

    },

});

export const eventRouterReducer = eventRouterSlice.reducer;

// Экспорт actions
export const eventRouterActions = eventRouterSlice.actions;