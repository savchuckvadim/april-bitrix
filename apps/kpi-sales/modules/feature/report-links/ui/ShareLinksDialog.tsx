'use client';

import { useEffect, useState } from 'react';
import { GlassCard } from '@workspace/april-ui';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import {
    Check,
    Copy,
    Eye,
    Link2Off,
    Loader2,
    Pin,
    RefreshCw,
} from 'lucide-react';
import type { ShareLinkDto } from '@workspace/nest-kpi-report-sales-api';
import { useReportLinks } from '../model/useReportLinks';
import {
    ShareLinkModeBadge,
    formatAgo,
    formatShortDate,
    linkPeriod,
} from './ShareLinkBadges';

/**
 * Стеклянная карточка со всеми ссылками: строка = название «от {автор}»
 * + период + статус обновления + просмотры; действия — копировать,
 * обновить сейчас, переключить обновляемость, отозвать (с подтверждением).
 */
export const ShareLinksDialog = () => {
    const {
        activeLinks,
        isManageOpen,
        mutatingToken,
        error,
        setManageOpen,
        copyUrl,
        revoke,
        refresh,
        toggleRefreshable,
        refetch,
    } = useReportLinks();
    const [copiedToken, setCopiedToken] = useState<string | null>(null);
    const [confirmToken, setConfirmToken] = useState<string | null>(null);

    // Пока диалог открыт — обновляем счётчики (онлайн/просмотры) раз в 15с.
    // До WS-фазы это единственный способ увидеть живой онлайн.
    useEffect(() => {
        if (!isManageOpen) return;
        refetch();
        const id = setInterval(refetch, 15_000);
        return () => clearInterval(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isManageOpen]);

    const handleCopy = async (token: string) => {
        if (await copyUrl(token)) {
            setCopiedToken(token);
            setTimeout(() => setCopiedToken(null), 1500);
        }
    };

    const handleRevoke = (link: ShareLinkDto) => {
        if (confirmToken !== link.token) {
            setConfirmToken(link.token);
            setTimeout(() => setConfirmToken(null), 3000);
            return;
        }
        setConfirmToken(null);
        revoke(link.token);
    };

    return (
        <Dialog open={isManageOpen} onOpenChange={setManageOpen}>
            <DialogContent
                className="w-[min(96vw,52rem)] max-w-none border-none bg-transparent p-0 shadow-none sm:max-w-none"
                overlayClassName="bg-black/20 backdrop-blur-md"
            >
                <GlassCard
                    intensity="liquid"
                    className="flex max-h-[80vh] flex-col overflow-hidden p-6"
                >
                    <DialogHeader>
                        <DialogTitle>Публичные ссылки на отчёт</DialogTitle>
                    </DialogHeader>

                    {error && (
                        <div className="mt-2 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
                            {error}
                        </div>
                    )}

                    <div className="mt-4 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                        {activeLinks.length === 0 && (
                            <div className="py-8 text-center text-sm text-muted-foreground">
                                Активных ссылок нет
                            </div>
                        )}

                        {activeLinks.map(link => {
                            const isMutating = mutatingToken === link.token;
                            return (
                                <div
                                    key={link.token}
                                    className="flex items-center gap-3 rounded-lg border border-border/60 bg-background/40 px-3 py-2"
                                >
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="truncate text-sm font-medium">
                                                {link.title}
                                            </span>
                                            <ShareLinkModeBadge link={link} />
                                        </div>
                                        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
                                            <span>{linkPeriod(link)}</span>
                                            <span>
                                                до {formatShortDate(link.expiresAt)}
                                            </span>
                                            {link.isRefreshable &&
                                                link.lastRefreshedAt && (
                                                    <span>
                                                        обновлено{' '}
                                                        {formatAgo(
                                                            link.lastRefreshedAt,
                                                        )}
                                                    </span>
                                                )}
                                            <span
                                                className="flex items-center gap-1"
                                                title="Уникальных зрителей / всего заходов"
                                            >
                                                <Eye className="h-3 w-3" />
                                                {link.uniqueViewCount} /{' '}
                                                {link.viewCount}
                                            </span>
                                            {link.onlineCount > 0 && (
                                                <span
                                                    className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400"
                                                    title="Смотрят прямо сейчас"
                                                >
                                                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                                    {link.onlineCount} онлайн
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex shrink-0 items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 w-7 cursor-pointer p-0"
                                            title="Копировать ссылку"
                                            onClick={() => handleCopy(link.token)}
                                        >
                                            {copiedToken === link.token ? (
                                                <Check className="h-3.5 w-3.5 text-emerald-500" />
                                            ) : (
                                                <Copy className="h-3.5 w-3.5" />
                                            )}
                                        </Button>

                                        {link.isRefreshable && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 w-7 cursor-pointer p-0"
                                                title="Обновить данные сейчас"
                                                disabled={isMutating}
                                                onClick={() => refresh(link.token)}
                                            >
                                                {isMutating ? (
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                ) : (
                                                    <RefreshCw className="h-3.5 w-3.5" />
                                                )}
                                            </Button>
                                        )}

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 cursor-pointer px-2 text-[11px]"
                                            title={
                                                link.isRefreshable
                                                    ? 'Сделать статичным снимком'
                                                    : 'Сделать обновляемой (период ≤ 1 мес)'
                                            }
                                            disabled={isMutating}
                                            onClick={() => toggleRefreshable(link)}
                                        >
                                            {link.isRefreshable ? (
                                                <Pin className="h-3.5 w-3.5" />
                                            ) : (
                                                <RefreshCw className="h-3.5 w-3.5" />
                                            )}
                                        </Button>

                                        <Button
                                            variant={
                                                confirmToken === link.token
                                                    ? 'destructive'
                                                    : 'ghost'
                                            }
                                            size="sm"
                                            className="h-7 cursor-pointer gap-1 px-2 text-[11px]"
                                            disabled={isMutating}
                                            onClick={() => handleRevoke(link)}
                                        >
                                            <Link2Off className="h-3.5 w-3.5" />
                                            {confirmToken === link.token
                                                ? 'Точно?'
                                                : 'Отозвать'}
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </GlassCard>
            </DialogContent>
        </Dialog>
    );
};
