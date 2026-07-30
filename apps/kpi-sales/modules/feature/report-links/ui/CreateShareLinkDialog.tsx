'use client';

import { useMemo, useState } from 'react';
import { GlassCard } from '@workspace/april-ui';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Switch } from '@workspace/ui/components/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { Check, Link2, Loader2 } from 'lucide-react';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { ReportDateType } from '@/modules/entities/report';
import { useReportLinks } from '../model/useReportLinks';
import {
    SHARE_LINK_MAX_ACTIVE,
    SHARE_LINK_MAX_REFRESHABLE_RANGE_DAYS,
    buildShareUrl,
} from '../model/report-links-thunks';
import { generateShareToken } from '../lib/share-token.util';
import { formatShortDate } from './ShareLinkBadges';
import { ShareLinkUrlField } from './ShareLinkUrlField';

const EXPIRES_OPTIONS = [
    { value: 1, label: '1 день' },
    { value: 3, label: '3 дня' },
    { value: 7, label: 'Неделя' },
    { value: 14, label: '2 недели (максимум)' },
];

const DAY_MS = 24 * 3600 * 1000;

/**
 * Создание публичной ссылки на текущий фильтр отчёта: название, срок
 * (≤14 дней), переключатель «обновляемая» (пересчёт каждые 15 минут;
 * доступен только при периоде фильтра ≤ 1 месяца). После создания URL
 * показывается в поле с автовыделением (буфер обмена во фрейме Битрикса
 * недоступен) + кнопка «открыть в новой вкладке».
 */
export const CreateShareLinkDialog = () => {
    const {
        isCreateOpen,
        isCreating,
        createdToken,
        error,
        activeLinks,
        create,
        setCreateOpen,
        clearCreatedToken,
    } = useReportLinks();
    const date = useAppSelector(s => s.report.date);

    // Свои активные+готовящиеся ссылки против лимита
    const usedCount = activeLinks.length;
    const limitReached = usedCount >= SHARE_LINK_MAX_ACTIVE;

    const [title, setTitle] = useState('');
    const [expiresInDays, setExpiresInDays] = useState(14);
    const [isRefreshable, setIsRefreshable] = useState(false);

    const rangeDays = useMemo(() => {
        const from = Date.parse(date[ReportDateType.FROM]);
        const to = Date.parse(date[ReportDateType.TO]);
        if (Number.isNaN(from) || Number.isNaN(to)) return 0;
        return Math.ceil((to - from) / DAY_MS);
    }, [date]);

    const refreshableAllowed =
        rangeDays <= SHARE_LINK_MAX_REFRESHABLE_RANGE_DAYS;

    const handleOpenChange = (open: boolean) => {
        setCreateOpen(open);
        if (!open) clearCreatedToken();
    };

    const handleCreate = () => {
        // Токен генерим на клиенте — URL известен и показывается сразу,
        // пока бэк асинхронно строит снимок; копирует пользователь сам из
        // поля (во фрейме Bitrix запись в буфер заблокирована).
        const token = generateShareToken();
        create({
            title: title.trim() || undefined,
            expiresInDays,
            isRefreshable: isRefreshable && refreshableAllowed,
            token,
        });
    };

    return (
        <Dialog open={isCreateOpen} onOpenChange={handleOpenChange}>
            <DialogContent
                className="w-[min(94vw,28rem)] max-w-none border-none bg-transparent p-0 shadow-none sm:max-w-none"
                overlayClassName="bg-black/20 backdrop-blur-md"
            >
                <GlassCard
                    intensity="liquid"
                    className="flex flex-col gap-4 p-6"
                >
                    <DialogHeader>
                        <DialogTitle>Поделиться отчётом</DialogTitle>
                    </DialogHeader>

                    <div className="text-xs text-muted-foreground">
                        Публичная read-only страница с текущим фильтром: период{' '}
                        <span className="font-medium text-foreground">
                            {formatShortDate(date[ReportDateType.FROM])} —{' '}
                            {formatShortDate(date[ReportDateType.TO])}
                        </span>
                        . Фильтры на странице менять нельзя, Excel — работает.
                    </div>

                    {/* Проактивный счётчик лимита */}
                    <div
                        className={
                            limitReached
                                ? 'rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive'
                                : 'text-xs text-muted-foreground'
                        }
                    >
                        Использовано {usedCount} из {SHARE_LINK_MAX_ACTIVE}{' '}
                        активных ссылок
                        {limitReached &&
                            ' — отзовите неиспользуемые, чтобы создать новую'}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="share-title" className="text-xs">
                            Название (необязательно)
                        </Label>
                        <Input
                            id="share-title"
                            value={title}
                            placeholder="от кого и за какой период — соберём сами"
                            onChange={e => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs">Срок жизни ссылки</Label>
                        <Select
                            value={String(expiresInDays)}
                            onValueChange={v => setExpiresInDays(Number(v))}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {EXPIRES_OPTIONS.map(opt => (
                                    <SelectItem
                                        key={opt.value}
                                        value={String(opt.value)}
                                    >
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-start justify-between gap-3 rounded-lg border border-border/60 bg-background/40 px-3 py-2.5">
                        <div>
                            <div className="text-sm">Обновляемая</div>
                            <div className="mt-0.5 text-[11px] text-muted-foreground">
                                {refreshableAllowed
                                    ? 'Данные пересчитываются каждые 15 минут'
                                    : `Доступно при периоде фильтра до ${SHARE_LINK_MAX_REFRESHABLE_RANGE_DAYS} дней (сейчас ${rangeDays})`}
                            </div>
                        </div>
                        <Switch
                            checked={isRefreshable && refreshableAllowed}
                            disabled={!refreshableAllowed}
                            onCheckedChange={setIsRefreshable}
                        />
                    </div>

                    {error && (
                        <div className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
                            {error}
                        </div>
                    )}

                    {createdToken ? (
                        <>
                            <div className="space-y-2 rounded-md bg-emerald-500/10 px-3 py-2.5">
                                <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
                                    <Check className="h-4 w-4 shrink-0" />
                                    Ссылка создана
                                </div>
                                <ShareLinkUrlField
                                    url={buildShareUrl(createdToken)}
                                />
                                <div className="text-[11px] text-muted-foreground">
                                    Кликните по полю — ссылка выделится
                                    целиком, скопируйте её (Ctrl+C) или
                                    откройте по стрелке в новой вкладке.
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    className="flex-1 cursor-pointer"
                                    onClick={() => {
                                        setTitle('');
                                        clearCreatedToken();
                                    }}
                                >
                                    Создать ещё
                                </Button>
                                <Button
                                    className="flex-1 cursor-pointer"
                                    onClick={() => handleOpenChange(false)}
                                >
                                    Готово
                                </Button>
                            </div>
                        </>
                    ) : (
                        <Button
                            className="cursor-pointer gap-2"
                            disabled={isCreating || limitReached}
                            onClick={handleCreate}
                        >
                            {isCreating ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Генерируем снимок данных…
                                </>
                            ) : (
                                <>
                                    <Link2 className="h-4 w-4" />
                                    Создать ссылку
                                </>
                            )}
                        </Button>
                    )}
                </GlassCard>
            </DialogContent>
        </Dialog>
    );
};
