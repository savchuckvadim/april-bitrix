'use client';

import { useState } from 'react';
import type { FC } from 'react';
import { Plus, RotateCcw, X } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { cn } from '@workspace/ui/lib/utils';
import type { EntityListGroup } from '../constants/entity-lists';

interface EntityListGroupEditorProps {
    group: EntityListGroup;
    items: string[];
    isEdited: boolean;
    onAdd: (value: string) => void;
    onRemove: (value: string) => void;
    onReset: () => void;
}

const TONE: Record<EntityListGroup['tone'], string> = {
    work: 'border-primary/50 text-primary',
    good: 'border-success/50 text-success',
    bad: 'border-destructive/50 text-destructive',
    neutral: 'border-border text-muted-foreground',
};

/**
 * Одна группа стадий или статусов: список строк, которые можно дополнять и
 * убирать.
 *
 * Правка не обязана быть окончательной — это черновик разговора, а не форма.
 * Поэтому у изменённой группы всегда есть возврат к составу по умолчанию, и
 * видно, что состав вообще трогали.
 */
export const EntityListGroupEditor: FC<EntityListGroupEditorProps> = ({
    group,
    items,
    isEdited,
    onAdd,
    onRemove,
    onReset,
}) => {
    const [draft, setDraft] = useState('');

    const submit = () => {
        onAdd(draft);
        setDraft('');
    };

    return (
        <div>
            <div className="flex items-center justify-between gap-2">
                <p className="text-muted-foreground text-[11px] font-bold tracking-widest uppercase">
                    {group.label}
                </p>
                {isEdited && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onReset}
                        title="Вернуть состав по умолчанию"
                        className="text-muted-foreground h-6 gap-1 px-1.5 text-[11px]"
                    >
                        <RotateCcw className="size-3" />
                        по умолчанию
                    </Button>
                )}
            </div>

            <ul className="mt-1.5 flex flex-wrap gap-1.5">
                {items.map(item => (
                    <li key={item}>
                        <span
                            className={cn(
                                'flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs',
                                TONE[group.tone],
                            )}
                        >
                            {item}
                            <button
                                type="button"
                                onClick={() => onRemove(item)}
                                aria-label={`Убрать «${item}»`}
                                title="Убрать"
                                className="hover:text-destructive cursor-pointer opacity-60 hover:opacity-100"
                            >
                                <X className="size-3" />
                            </button>
                        </span>
                    </li>
                ))}
                {items.length === 0 && (
                    <li className="text-muted-foreground text-xs">
                        Пусто — добавьте, если такие всё же нужны.
                    </li>
                )}
            </ul>

            <div className="mt-2 flex gap-1.5">
                <Input
                    value={draft}
                    onChange={event => setDraft(event.target.value)}
                    onKeyDown={event => event.key === 'Enter' && submit()}
                    placeholder="Добавить"
                    className="h-8 text-xs"
                />
                <Button
                    variant="outline"
                    size="icon"
                    onClick={submit}
                    disabled={!draft.trim()}
                    aria-label="Добавить"
                    className="size-8 shrink-0"
                >
                    <Plus className="size-4" />
                </Button>
            </div>
        </div>
    );
};
