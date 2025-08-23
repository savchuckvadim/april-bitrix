import {
  DocumentRoutes,
  ROUTE_DOCUMENT,
  ROUTE_DOCUMENT_NAME,
  RouteDocument,
} from "@/modules/konstructor/processes/routes/types/router-type";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";

type DocumentRouterState = typeof initialState;
interface SetCurrentDocumentRoutePayload {
  route: ROUTE_DOCUMENT;
}
const initialState = {
  routes: {
    [ROUTE_DOCUMENT.COMPLECT_SETTINGS]: {
      id: 0,
      name: ROUTE_DOCUMENT_NAME.COMPLECT_SETTINGS,
      route: ROUTE_DOCUMENT.COMPLECT_SETTINGS,
    } as RouteDocument,

    [ROUTE_DOCUMENT.COMPLECT]: {
      id: 1,
      name: ROUTE_DOCUMENT_NAME.COMPLECT,
      route: ROUTE_DOCUMENT.COMPLECT,
    } as RouteDocument,

    [ROUTE_DOCUMENT.PRODUCTS]: {
      id: 2,
      name: ROUTE_DOCUMENT_NAME.PRODUCTS,
      route: ROUTE_DOCUMENT.PRODUCTS,
    } as RouteDocument,

    [ROUTE_DOCUMENT.TEMPLATE]: {
      id: 3,
      name: ROUTE_DOCUMENT_NAME.TEMPLATE,
      route: ROUTE_DOCUMENT.TEMPLATE,
    } as RouteDocument,

    [ROUTE_DOCUMENT.DOCUMENT_SETTINGS]: {
      id: 3,
      name: ROUTE_DOCUMENT_NAME.DOCUMENT_SETTINGS,
      route: ROUTE_DOCUMENT.DOCUMENT_SETTINGS,
    } as RouteDocument,
  } as DocumentRoutes,

  current: {
    id: 0,
    name: ROUTE_DOCUMENT_NAME.COMPLECT_SETTINGS,
    route: ROUTE_DOCUMENT.COMPLECT_SETTINGS,
  } as RouteDocument,
  previous: null as null | RouteDocument,
};

const documentRouterSlice = createSlice({
  name: "documentRouter",
  initialState,
  reducers: {
    setCurrentRoute(
      state: DocumentRouterState,
      action: PayloadAction<SetCurrentDocumentRoutePayload>,
    ) {
      const payloadRoute = action.payload.route as ROUTE_DOCUMENT;
      const current = state.routes[payloadRoute];

      const previous = state.current as RouteDocument | null;
      // const next = state.previous as RouteDocument | null
      if (current) {
        state.current = current;
        state.previous = previous;
        // state.next = next
      }
    },
  },
});

export const documentRouterReducer = documentRouterSlice.reducer;

// Экспорт actions
export const documentRouterActions = documentRouterSlice.actions;
