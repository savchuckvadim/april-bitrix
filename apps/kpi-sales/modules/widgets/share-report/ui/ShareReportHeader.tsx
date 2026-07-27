'use client';

import { Button } from '@workspace/ui/components/button';
import { ThemeTogglePanel } from '@workspace/theme';
import { Download, Loader2, RefreshCw } from 'lucide-react';
import type { ShareLinkPublicMetaDto } from '@workspace/nest-kpi-report-sales-api';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    formatAgo,
    formatShortDate,
} from '@/modules/feature/report-links/ui/ShareLinkBadges';
import { getShareDownload } from '../model/share-download-thunk';

/**
 * Шапка публичной read-only страницы: название/автор/период, для
 * обновляемых — «обновлено N назад», тема и скачивание Excel.
 * Фильтров нет by design: «какой фильтр скинули — такой и смотришь».
 */
export const ShareReportHeader = ({
    meta,
    token,
}: {
    meta: ShareLinkPublicMetaDto;
    token: string;
}) => {
    const dispatch = useAppDispatch();
    const isDownloading = useAppSelector(s => s.download.isDownloading);

    return (
        <div className="bg-background/50 backdrop-blur-sm fixed top-0 left-0 right-0 z-10 min-w-full">
            <div className="flex h-15 w-full items-center justify-between p-5">
                <div className="flex min-w-0 flex-row items-center">
                    <ThemeTogglePanel />
                    <h1 className="text-md ml-2 truncate font-bold">
                        {meta.title}
                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                            {formatShortDate(meta.periodFrom)} —{' '}
                            {formatShortDate(meta.periodTo)}
                        </span>
                    </h1>
                    {meta.isRefreshable && (
                        <span className="ml-3 flex shrink-0 items-center gap-1 text-[11px] text-muted-foreground">
                            <RefreshCw className="h-3 w-3" />
                            обновлено{' '}
                            {formatAgo(meta.lastRefreshedAt ?? meta.generatedAt)}
                        </span>
                    )}
                </div>
                <Button
                    variant="outline"
                    className="h-8 shrink-0 cursor-pointer gap-1.5"
                    disabled={isDownloading}
                    onClick={() => dispatch(getShareDownload(token))}
                >
                    {isDownloading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Download className="h-4 w-4" />
                    )}
                    Excel
                </Button>
            </div>
        </div>
    );
};
