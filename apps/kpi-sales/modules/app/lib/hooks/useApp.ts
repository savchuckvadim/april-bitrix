import {
    sendDownloadingReport,
    sendExpiredEnd,
    sendExpiredStart,
} from '../../model/AppThunk';
import { useAppDispatch, useAppSelector } from './redux';

export const useApp = () => {
    const dispatch = useAppDispatch();
    const app = useAppSelector(state => state.app);
    const domain = app.domain;  
    return {
        domain,
        initialized: app.initialized,
        sendExpiredStart: () => dispatch(sendExpiredStart()),
        sendExpiredEnd: () => dispatch(sendExpiredEnd()),
        sendDownloadingReport: () => dispatch(sendDownloadingReport()),
    };
};
