'use client';

import { SectionCard } from '@workspace/april-ui/surfaces';
import type { KRow } from '@/modules/entities/row-set';
import { useCompositionEditor } from '../hooks/use-composition-editor';
import { CompositionEditorBody } from './CompositionEditorBody';
import { CompositionToolbar } from './CompositionToolbar';

export interface CompositionEditorPanelProps {
    row: KRow | null;
}

/**
 * Наполнение строки карточкой на экране (шаг «Комплект», легаси
 * CheckboxesContainer): категории сворачиваются, в шапке — вес и режим.
 */
export const CompositionEditorPanel = ({ row }: CompositionEditorPanelProps) => {
    const editor = useCompositionEditor(row);
    if (!row || !editor.composition) return null;

    return (
        <SectionCard
            title={`Наполнение: ${row.names.shortName}`}
            actions={<CompositionToolbar editor={editor} />}
        >
            <CompositionEditorBody editor={editor} />
        </SectionCard>
    );
};
