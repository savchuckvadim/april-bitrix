'use client';
import { Download } from 'lucide-react';
import React from 'react';

import useDownload from '../model/useDownload';
import { EDownloadType } from '../model/download-thunk';
import { HeaderAction, Preloader } from '@/modules/shared';

/**
 * Кнопка выгрузки отчёта в Excel. Видна на вкладках, где есть что выгружать
 * (вкладки отчёта и «Финансы»); неактивна, пока данные вкладки ещё считаются.
 */
export default function DownLoad() {
    const { handleDownload, isDownloading, downloadType, availability } =
        useDownload();
    const isExcelLoading =
        isDownloading && downloadType === EDownloadType.EXCEL;
    // const isPdfLoading = isDownloading && downloadType === EDownloadType.PDF

    if (!availability.visible) return null;

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
                    disabled={!availability.ready}
                    onClick={() => handleDownload(EDownloadType.EXCEL)}
                />
            )}
        </div>
    );
}
