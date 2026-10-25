'use client';

import { useState } from 'react';
import { Archive, BadgePercent, Check, Pencil, Star, Trash2, X } from 'lucide-react';
import { ActionTile } from '@workspace/april-ui/actions';
import { ToneBadge } from '@workspace/april-ui/badges';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import {
    LIBRARY_VISIBILITY_TITLE,
    libraryItemTitle,
    type LibraryItem,
} from '@/modules/entities/library';

interface LibraryItemCardProps {
    item: LibraryItem;
    busy: boolean;
    onLoad: () => void;
    onRename: (title: string) => void;
    onArchive: () => void;
    onRemove: () => void;
}

/** Плитка заготовки: клик — в конструктор; свои — переименовать/архив/удалить. */
export const LibraryItemCard = ({
    item,
    busy,
    onLoad,
    onRename,
    onArchive,
    onRemove,
}: LibraryItemCardProps) => {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(libraryItemTitle(item));
    const isPromotion = item.kind === 'promotion';

    const commit = () => {
        if (draft.trim()) onRename(draft.trim());
        setEditing(false);
    };

    return (
        <div className="flex flex-col gap-1">
            {editing ? (
                <div className="flex items-center gap-1">
                    <Input
                        autoFocus
                        className="h-8 text-sm"
                        value={draft}
                        onChange={event => setDraft(event.target.value)}
                        onKeyDown={event => {
                            if (event.key === 'Enter') commit();
                            if (event.key === 'Escape') setEditing(false);
                        }}
                    />
                    <Button size="icon" variant="ghost" aria-label="Сохранить название" onClick={commit}>
                        <Check className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" aria-label="Отмена" onClick={() => setEditing(false)}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            ) : (
                <ActionTile
                    icon={isPromotion ? BadgePercent : Star}
                    tone={isPromotion ? 'info' : 'warning'}
                    title={libraryItemTitle(item)}
                    description={item.dealName && item.title ? `Из сделки: ${item.dealName}` : undefined}
                    disabled={busy}
                    badge={
                        <ToneBadge tone="muted" variant="soft">
                            {busy ? 'загружаю…' : LIBRARY_VISIBILITY_TITLE[item.visibility]}
                        </ToneBadge>
                    }
                    onClick={onLoad}
                />
            )}
            {item.canEdit && !editing ? (
                <div className="flex justify-end gap-1 text-muted-foreground">
                    <Button size="icon" variant="ghost" aria-label="Переименовать" onClick={() => setEditing(true)}>
                        <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" aria-label="В архив" onClick={onArchive}>
                        <Archive className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" aria-label="Удалить" onClick={onRemove}>
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            ) : null}
        </div>
    );
};
