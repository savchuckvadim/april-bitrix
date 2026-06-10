import { IBXDeal } from '@bitrix/index';
import { IDealFieldsData } from '../../type/deal-field.type';

/**
 * TODO(@alfa migration): builds the deal's field+value list for the seminar deal.
 * The original implementation called alfa-specific back endpoints (SEMINAR_*,
 * which no longer exist on the frontend `EBACK_ENDPOINT`) and iterated the removed
 * `BxDealData` configuration object. Both sources are gone, so this is stubbed to
 * return an empty list. Restore once the deal-field source is available.
 */
export const getDealFieldsData = async (
    _deal: IBXDeal,
): Promise<IDealFieldsData[]> => {
    return [];
};
