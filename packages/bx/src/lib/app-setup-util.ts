import { BXUser, InitBxResult} from "../type/bitrix-type";
import { Placement, PlacementCallCard, EntitiesFromPlacement } from "../type/placement-type";
import { getDisplayMode } from "../lib/placement-util";
// import { bx } from "@workspace/api";

export const getAppPlacement = async (): Promise<{
  placement: Placement | PlacementCallCard | null;
  companyPlacement: Placement;
}> => {
  const result = {
    placement: null as Placement | PlacementCallCard | null,
    companyPlacement: {
      placement: "COMPANY",
      options: {
        ID: 0,
      },
    } as Placement as Placement,
  };

  // result.placement = __IN_BITRIX__ ? ((await bx.getPlacement()) as Placement | null) : null;

  return result;
};




export const initAppEntities = async (
  entitiesFromPlacement: EntitiesFromPlacement,
  domain: string,
  user: BXUser,
  placement: Placement | PlacementCallCard
): Promise<InitBxResult> => {
  const currentCompany = entitiesFromPlacement.currentCompany;
  const currentDeal = entitiesFromPlacement.currentDeal;
  const companyPlacement = entitiesFromPlacement.companyPlacement;
  const currentTask = entitiesFromPlacement.currentTask;
  // const isDetail = isDetailPlacement(placement)
  // const isActivity = isActivityPlacement(placement)
  // const isTask = isTaskPlacement(placement)
  const displayMode = getDisplayMode(placement);

  // if (displayMode == DISPLAY_MODE.ENTITY_CARD) {
  //   __IN_BITRIX__ && (await bx.getFit());
  // }

  return {
    domain,
    user,
    placement: companyPlacement,
    company: currentCompany,
    deal: currentDeal,
    display: displayMode,
    // isDetail,
    // isTask,
    task: currentTask,
  };
};
