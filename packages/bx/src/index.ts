export { getAppPlacement, initAppEntities } from "./lib/app-setup-util";
export { getEntitiesFromPlacement } from "./lib//placement-util";

//type
export type {
  InitBxResult,
  BXTask,
  BXUser,
  BXLead,
  BXCompany,
  BXSmart,
  BXDeal,
  BXList,
  BXContact,
} from "./type/bitrix-type";

export type {
  PlacementCallCard,
  PLACEMENT_ENTITY,
  Placement,
  EntitiesFromPlacement,
  CustomPlacement
} from "./type/placement-type";

//enum
export { DISPLAY_MODE } from "./type/placement-type";
