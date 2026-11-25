import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { useAppDispatch } from '@/modules/app/lib/hooks/redux';
import { getDownload, EDownloadType } from './download-thunk';
import { useReport } from '@/modules/entities/report/model/useReport';
import { resolveDownloadAvailability } from '../lib/download-availability.util';

export default function useDownload() {
    const dispatch = useAppDispatch();
    const isDownloading = useAppSelector(state => state.download.isDownloading);
    const downloadType = useAppSelector(state => state.download.downloadType);
    const reportType = useAppSelector(state => state.reportType.current);
    const isCallingsLoading = useAppSelector(
        state => state.callingStatistics.isLoading,
    );
    const isCallingsFetched = useAppSelector(
        state => state.callingStatistics.isFetched,
    );
    const { report, isLoading, isFetched } = useReport();
    const handleDownload = (type: EDownloadType) => {
        dispatch(getDownload(type, report));
    };
    return {
        isDownloading,
        downloadType,
        handleDownload,
        /** Есть ли что выгружать на текущей вкладке и загружены ли данные. */
        availability: resolveDownloadAvailability(reportType, {
            events: { isLoading, isFetched },
            callings: {
                isLoading: isCallingsLoading,
                isFetched: isCallingsFetched,
            },
        }),
    };
}
