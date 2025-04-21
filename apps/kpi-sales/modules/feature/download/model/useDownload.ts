import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { useAppDispatch } from '@/modules/app/lib/hooks/redux';
import { getDownload, EDownloadType } from './download-thunk';
import { useReport } from '@/modules/entities/report/model/useReport';


export default function useDownload() {
  const dispatch = useAppDispatch();
  const isDownloading = useAppSelector(state => state.download.isDownloading);
  const downloadType = useAppSelector(state => state.download.downloadType);
  const { report } = useReport();
  const handleDownload = (type: EDownloadType) => {
    dispatch(getDownload(type, report));
  }
  return {
    isDownloading,
    downloadType,
    handleDownload

  };
}
