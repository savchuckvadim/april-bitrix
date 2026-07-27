'use client';

import { useMemo, useState } from 'react';
import { GlassCard } from '@workspace/april-ui';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { Input } from '@workspace/ui/components/input';
import { Eye, Loader2 } from 'lucide-react';
import type { BXUser } from '@workspace/bx';
import { useAppDispatch, useAppSelector } from '@/modules/app';
import { activateViewAs } from '../model/view-as-thunks';

interface ViewAsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

/**
 * Выбор пользователя для режима «Смотреть как…»: все сотрудники полной
 * структуры (departments всегда полные — периметр режется отдельно),
 * поиск по имени. Клик — активация: структура/фильтр/отчёты
 * перезагружаются от имени выбранного, роль бэк определит сам.
 */
export const ViewAsDialog = ({ open, onOpenChange }: ViewAsDialogProps) => {
    const dispatch = useAppDispatch();
    const departments = useAppSelector(s => s.department.departments);
    const status = useAppSelector(s => s.department.status);
    const [query, setQuery] = useState('');
    const [pendingId, setPendingId] = useState<string | null>(null);

    const users = useMemo(() => {
        const byId = new Map<string, BXUser>();
        departments.forEach(dep =>
            dep.allUsers.forEach(user => {
                if (user?.ID) byId.set(String(user.ID), user);
            }),
        );
        const q = query.trim().toLowerCase();
        return [...byId.values()]
            .filter(
                user =>
                    !q ||
                    `${user.NAME ?? ''} ${user.LAST_NAME ?? ''}`
                        .toLowerCase()
                        .includes(q),
            )
            .sort((a, b) =>
                `${a.LAST_NAME}${a.NAME}`.localeCompare(
                    `${b.LAST_NAME}${b.NAME}`,
                    'ru',
                ),
            );
    }, [departments, query]);

    const handlePick = async (user: BXUser) => {
        setPendingId(String(user.ID));
        await dispatch(activateViewAs(user));
        setPendingId(null);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="w-[min(94vw,26rem)] max-w-none border-none bg-transparent p-0 shadow-none sm:max-w-none"
                overlayClassName="bg-black/20 backdrop-blur-md"
            >
                <GlassCard
                    intensity="liquid"
                    className="flex max-h-[75vh] flex-col gap-3 overflow-hidden p-6"
                >
                    <DialogHeader>
                        <DialogTitle>Смотреть как…</DialogTitle>
                    </DialogHeader>
                    <p className="text-xs text-muted-foreground">
                        Отчёт откроется глазами выбранного сотрудника: его
                        периметр, его сохранённый фильтр. Его настройки при
                        этом не изменятся — сохранение в этом режиме
                        отключено.
                    </p>
                    <Input
                        value={query}
                        placeholder="Поиск сотрудника…"
                        onChange={e => setQuery(e.target.value)}
                    />
                    <div className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
                        {users.map(user => (
                            <button
                                key={String(user.ID)}
                                type="button"
                                disabled={status === 'loading'}
                                onClick={() => handlePick(user)}
                                className="flex w-full cursor-pointer items-center gap-2 rounded-md border border-border/60 bg-background/40 px-3 py-2 text-left text-sm transition-colors hover:bg-accent disabled:opacity-50"
                            >
                                {pendingId === String(user.ID) ? (
                                    <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
                                ) : (
                                    <Eye className="h-3.5 w-3.5 shrink-0 opacity-50" />
                                )}
                                <span className="truncate">
                                    {user.LAST_NAME} {user.NAME}
                                </span>
                                <span className="ml-auto shrink-0 text-[11px] text-muted-foreground">
                                    ID {String(user.ID)}
                                </span>
                            </button>
                        ))}
                        {!users.length && (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                                Никого не нашли
                            </div>
                        )}
                    </div>
                </GlassCard>
            </DialogContent>
        </Dialog>
    );
};
