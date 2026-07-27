'use client';

import { Badge } from '@workspace/ui/components/badge';
import { RefreshCw, Pin, Loader2 } from 'lucide-react';
import type { ShareLinkDto } from '@workspace/nest-kpi-report-sales-api';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

export const formatShortDate = (iso: string | null | undefined): string => {
    if (!iso) return '';
    try {
        return format(parseISO(iso), 'd MMM yyyy', { locale: ru });
    } catch {
        return iso.slice(0, 10);
    }
};

export const formatAgo = (iso: string | null | undefined): string => {
    if (!iso) return '';
    try {
        return formatDistanceToNow(parseISO(iso), {
            addSuffix: true,
            locale: ru,
        });
    } catch {
        return '';
    }
};

/** Период фильтра ссылки: «1 июл 2026 — 24 июл 2026». */
export const linkPeriod = (link: ShareLinkDto): string =>
    `${formatShortDate(link.periodFrom)} — ${formatShortDate(link.periodTo)}`;

/** Ссылка ещё готовится (async-создание): снимок строится фоном. */
export const isPendingLink = (link: ShareLinkDto): boolean =>
    link.status === 'pending';

/** Бейдж режима: готовится / обновляемая (15 мин) / статичный снимок. */
export const ShareLinkModeBadge = ({ link }: { link: ShareLinkDto }) => {
    if (isPendingLink(link)) {
        return (
            <Badge className="gap-1 bg-amber-500/15 text-amber-600 text-[10px] dark:text-amber-400">
                <Loader2 className="h-2.5 w-2.5 animate-spin" />
                готовится
            </Badge>
        );
    }
    return link.isRefreshable ? (
        <Badge variant="secondary" className="gap-1 text-[10px]">
            <RefreshCw className="h-2.5 w-2.5" />
            обновляемая
        </Badge>
    ) : (
        <Badge variant="outline" className="gap-1 text-[10px]">
            <Pin className="h-2.5 w-2.5" />
            снимок
        </Badge>
    );
};
