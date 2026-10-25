export { DealSendButton } from './ui/DealSendButton';
export { useDealSend } from './hooks/use-deal-send';
export { sendDeal } from './model/deal-send-thunk';
export { dealSendActions, dealSendReducer, type DealSendState } from './model/DealSendSlice';
export {
    buildDealSendRequest,
    buildInfoblockFields,
    buildProductFields,
    type DealSendInput,
    type DealSendRequest,
} from './lib/build-deal-send.util';
