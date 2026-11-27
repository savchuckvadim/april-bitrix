'use client';

import { GlassDialog } from '@workspace/april-ui';
import { Button } from '@workspace/ui/components/button';
import {
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import type { CompositionEditorState } from '../hooks/use-composition-editor';
import { useRegionsEditor } from '../hooks/use-regions-editor';
import { CompositionMessages } from './CompositionMessages';
import { RegionsDialogRow } from './RegionsDialogRow';
import { RegionsDialogToolbar } from './RegionsDialogToolbar';
import { RegionsDialogTotals } from './RegionsDialogTotals';

export interface RegionsDialogProps {
    editor: CompositionEditorState;
}

/**
 * Региональное законодательство состава окном: заменить регион клиента и
 * добавить любые другие, у каждого отметить «считать вес» или «не считать».
 * Правки живут в окне до «Сохранить»; «Отмена», Esc и клик мимо окна их
 * отбрасывают.
 */
export const RegionsDialog = ({ editor }: RegionsDialogProps) => {
    const regions = useRegionsEditor(editor, editor.regions.closeDialog);

    return (
        <GlassDialog
            open
            onOpenChange={next => (next ? undefined : editor.regions.closeDialog())}
            size="lg"
            intensity="soft"
            cardClassName="max-h-[88vh] gap-4 overflow-hidden"
        >
            <DialogHeader>
                <DialogTitle>Региональное законодательство</DialogTitle>
                <DialogDescription>
                    Отметьте регионы, законодательство которых входит в состав. Вес региона берётся из
                    каталога: добавленный регион считает вес, при необходимости отключите.
                </DialogDescription>
            </DialogHeader>
            <RegionsDialogToolbar editor={regions} />
            <div className="min-h-0 overflow-y-auto pr-1">
                {regions.rows.map(row => (
                    <RegionsDialogRow
                        key={row.region.code}
                        row={row}
                        isClient={row.region.code === regions.clientRegionCode}
                        onToggle={() => regions.toggleRegion(row.region.code)}
                        onCounted={counted => regions.setCounted(row.region.code, counted)}
                    />
                ))}
                {!regions.rows.length ? (
                    <p className="px-2 py-3 text-sm text-muted-foreground">Ничего не найдено</p>
                ) : null}
            </div>
            <RegionsDialogTotals editor={regions} />
            <CompositionMessages violations={[]} blocked={regions.blocked} autoFixes={[]} />
            <DialogFooter className="gap-2 border-t pt-3">
                <Button variant="outline" onClick={editor.regions.closeDialog}>
                    Отмена
                </Button>
                <Button disabled={!regions.changed} onClick={regions.save}>
                    Сохранить
                </Button>
            </DialogFooter>
        </GlassDialog>
    );
};
