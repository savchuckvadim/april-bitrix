'use client';

import { Pencil } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@workspace/ui/components/popover';
import { useIskraSubtitleEditor } from '../hooks/use-iskra-subtitle-editor';

export interface IskraSubtitleEditorProps {
    baseName: string;
    subtitle: string | null;
    onChange: (subtitle: string | null) => void;
}

/** Своя подпись Искры для документов (легаси IscraLtCheckbox); пустая — имя из каталога. */
export const IskraSubtitleEditor = ({ baseName, subtitle, onChange }: IskraSubtitleEditorProps) => {
    const editor = useIskraSubtitleEditor(subtitle, onChange);

    return (
        <Popover open={editor.open} onOpenChange={editor.setOpen}>
            <PopoverTrigger
                aria-label={`Подпись: ${baseName}`}
                className="inline-flex size-5 cursor-pointer items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
            >
                <Pencil aria-hidden className="size-3" />
            </PopoverTrigger>
            <PopoverContent align="end" className="flex w-80 max-w-[90vw] flex-col gap-2 p-3">
                <span className="text-xs text-muted-foreground">Как назвать сервис в документах</span>
                <Input
                    autoFocus
                    value={editor.draft}
                    placeholder={baseName}
                    onChange={event => editor.setDraft(event.target.value)}
                    onKeyDown={event => {
                        if (event.key === 'Enter') editor.save();
                    }}
                />
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={editor.reset}>
                        Как в каталоге
                    </Button>
                    <Button size="sm" onClick={editor.save}>
                        Сохранить
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
};
