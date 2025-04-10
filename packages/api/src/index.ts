//

// api
export { hookAPI as hook } from "./services/april-hook-api";
export { url as hookURL } from "./services/april-hook-api";

export { onlineAPI as online } from "./services/april-online-api";
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
