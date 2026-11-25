'use client';
import { Download } from 'lucide-react';
import React from 'react';

import useDownload from '../model/useDownload';
import { EDownloadType } from '../model/download-thunk';
import { HeaderAction, Preloader } from '@/modules/shared';

export default function DownLoad() {
    const { handleDownload, isDownloading, downloadType } = useDownload();
    const isExcelLoading =
        isDownloading && downloadType === EDownloadType.EXCEL;
    // const isPdfLoading = isDownloading && downloadType === EDownloadType.PDF

    return (
        <div className="flex flex-row items-between">
            {isExcelLoading ? (
                <div className="mr-3">
                    <Preloader />
                </div>
            ) : (
                <HeaderAction
                    icon={Download}
                    label="Скачать в Excel"
                    onClick={() => handleDownload(EDownloadType.EXCEL)}
                />
            )}
        </div>
    );
}
