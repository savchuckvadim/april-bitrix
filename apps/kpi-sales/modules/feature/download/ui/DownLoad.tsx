'use client';
import { Download } from 'lucide-react';
import React from 'react';

import { Button } from '@workspace/ui/components/button';
import useDownload from '../model/useDownload';
import { EDownloadType } from '../model/download-thunk';
import { Preloader } from '@/modules/shared';

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
                <Button
                    onClick={() => handleDownload(EDownloadType.EXCEL)}
                    className="h-8 cursor-pointer icon"
                    variant="outline"
                    style={{ cursor: 'pointer' }}
                >
                    <Download />
                </Button>
            )}
        </div>
    );
}
