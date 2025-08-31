import {
    sendDownloadingReport,
    sendExpiredEnd,
    sendExpiredStart,
} from '../../model/AppThunk';
import { useAppDispatch } from './redux';

export const useApp = () => {
    const dispatch = useAppDispatch();
    return {
        sendExpiredStart: () => dispatch(sendExpiredStart()),
        sendExpiredEnd: () => dispatch(sendExpiredEnd()),
        sendDownloadingReport: () => dispatch(sendDownloadingReport()),
    };
};
