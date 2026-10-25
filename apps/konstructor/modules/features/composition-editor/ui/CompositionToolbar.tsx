'use client';

import { ChevronsDownUp, ChevronsUpDown } from 'lucide-react';
import { IconAction } from '@workspace/april-ui/actions';
import { ToneBadge } from '@workspace/april-ui/badges';
import { Button } from '@workspace/ui/components/button';
import type { CompositionEditorState } from '../hooks/use-composition-editor';

export interface CompositionToolbarProps {
    editor: CompositionEditorState;
}

/** Вес против эталона, режим правил и «развернуть/свернуть все категории». */
export const CompositionToolbar = ({ editor }: CompositionToolbarProps) => {
    const { composition, weightCheck, sections } = editor;
    if (!composition) return null;

    return (
        <div className="flex flex-wrap items-center gap-2">
            {weightCheck ? (
                <ToneBadge
                    tone={weightCheck.matches ? 'success' : 'destructive'}
                    variant="soft"
                    title="Вес наполнения против эталона комплекта"
                >
                    Вес {weightCheck.weight} / {weightCheck.expected}
                </ToneBadge>
            ) : null}
            <Button variant="outline" size="sm" onClick={editor.toggleMode}>
                {composition.mode === 'rules' ? 'По правилам' : 'Без правил'}
            </Button>
            <IconAction
                icon={sections.isAllOpen ? ChevronsDownUp : ChevronsUpDown}
                label={
                    sections.isAllOpen
                        ? 'Свернуть все категории'
                        : 'Развернуть все категории'
                }
                onClick={sections.toggleAll}
                size="md"
            />
        </div>
    );
};
