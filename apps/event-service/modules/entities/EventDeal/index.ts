export { eventDealReducer, eventDealActions } from './model/EventDealSlice';
export { setInitEventDeal, updateDealContractDate } from './model/EventDealThunk';
export { useEventDeal } from './hook/useEventDeal';
export { DealMiniHeader } from './ui/DealMiniHeader';
export { EV_DEAL_PROP, EV_DEAL_FIELD_CODES } from './type/event-deal-type';
export {
    countContractMonths,
    isGiftMonths,
    formatRuDate,
    normalizeToDateOnly,
    GIFT_WARNING_MONTHS,
} from './lib/contract-months.util';
