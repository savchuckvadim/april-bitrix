//reducer
export { eventServiceTaskReducer, eventServiceTaskActions} from "./model/EventServiceTaskSlice";

//thunk
export { initialEventServiceTasks } from "./model/EventServiceTaskThunk";

export { serviceTaskAPI } from "./model/EventServiceTaskService";

//hooks
export { useTask } from "./hooks/event-service-task-hook";