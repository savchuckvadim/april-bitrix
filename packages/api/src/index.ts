//

//config
export { setConfig } from "./lib/config";

// api
export { backAPI, EBACK_ENDPOINT, EResultCode } from "./services/back-api";
export type { IBackResponse } from "./services/back-api";
export { hookAPI as hook } from "./services/april-hook-api";
export { url as hookURL } from "./services/april-hook-api";

export { onlineAPI } from "./services/online/online-api";
export { onlineGeneralAPI } from "./services/april-online-api";
export {
  SETUP_ENDPOINT,
  ONLINE_KONSTRUCTOR_ENDPOINTS
} from './services/online/type/setup-type'
export type {

  BitrixAppToken,
  BitrixAppPlacement,
  BitrixAppPayload,
  BitrixAppPlacementPayload
} from './services/online/type/setup-type'
export type {
  OnlineResponse
} from './services/online/type/response-type'

export { url as onlineURL } from "./services/april-online-api";
export { onlineHeaders } from "./services/april-hook-api";


export { eventServiceAPI as evs } from "./services/april-service-event-api";
// export { bitrixAPI as bx } from "./services/bitrix-general-api";
// export { bitrixActivityAPI as bxActivityAPI } from "./services/bitrix-activity-api"
export { bxAPI } from "./services/bx-api"
export { getBxService } from "./services/bx-api"

export { AIServiceAPI } from "./services/ai-service"
export { TranscribeServiceAPI } from "./services/transcribe-service"




//loacal storage
export {
  saveToLocalStorage,
  getFromLocalStorage,
  clearFromLocalStorage,
  getStorageKey
} from "./services/local-encrypt";

export { localAPI as local } from "./services/local";

//utils
export { getApiHeaders } from "./lib/header";

//type
export { API_METHOD } from "./type/type";


export { getAppPlacement, initAppEntities } from "./lib/app-setup-util";
export { getEntitiesFromPlacement, getDisplayMode } from "./lib/placement-util";
