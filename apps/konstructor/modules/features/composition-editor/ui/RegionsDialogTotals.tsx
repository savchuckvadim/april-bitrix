'use client';

import { cn } from '@workspace/ui/lib/utils';
import type { RegionsEditorState } from '../hooks/use-regions-editor';

export interface RegionsDialogTotalsProps {
    editor: RegionsEditorState;
}

/** Итог окна: вес выбранных регионов и вес всего состава после сохранения против комплекта. */
export const RegionsDialogTotals = ({ editor }: RegionsDialogTotalsProps) => {
    const { complectWeight } = editor;

    return (
        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
            <div>
                Выбрано регионов: <span className="tabular-nums">{editor.selectedCount}</span> · вес регионов:{' '}
                <span className="tabular-nums">{editor.weight}</span>
            </div>
            {complectWeight ? (
                <div className={cn(!complectWeight.fits && 'text-warning')}>
                    Вес состава после сохранения: <span className="tabular-nums">{complectWeight.weight}</span> из{' '}
                    <span className="tabular-nums">{complectWeight.expected}</span>
                    {complectWeight.fits ? '' : ' (не совпадает с комплектом)'}
                </div>
            ) : null}
        </div>
    );
};
