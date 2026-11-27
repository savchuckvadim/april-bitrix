'use client';

import { Search } from 'lucide-react';
import { FilterChips } from '@workspace/april-ui/fields';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import type { RegionsEditorState } from '../hooks/use-regions-editor';

export interface RegionsDialogToolbarProps {
    editor: RegionsEditorState;
}

/** Поиск по названию, фильтры «все / отмеченные / считать вес / не считать» и переключатель «Все регионы». */
export const RegionsDialogToolbar = ({ editor }: RegionsDialogToolbarProps) => (
    <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-0 flex-1">
                <Search
                    aria-hidden
                    className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                    value={editor.query}
                    onChange={event => editor.setQuery(event.target.value)}
                    placeholder="Найти регион"
                    aria-label="Поиск региона"
                    className="pl-8"
                />
            </div>
            {editor.canToggleShowAll ? (
                <Button variant="ghost" size="sm" onClick={editor.toggleShowAll}>
                    {editor.showAll ? 'Только регионы портала' : 'Все регионы'}
                </Button>
            ) : null}
        </div>
        <FilterChips
            ariaLabel="Фильтр регионов"
            items={editor.filters}
            onToggle={editor.setFilter}
        />
    </div>
);
