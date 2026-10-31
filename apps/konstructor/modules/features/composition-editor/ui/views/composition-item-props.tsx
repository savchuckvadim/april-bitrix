import type { ReactNode } from 'react';
import type { CompositionEditorState } from '../../hooks/use-composition-editor';
import type { CompositionSectionItemView, SectionKind } from '../../lib/composition-sections.util';
import { LtItemControls } from '../LtItemControls';
import { WeightMark } from '../WeightMark';

export interface CompositionItemProps {
    name: string;
    checked: boolean;
    disabled?: boolean;
    onToggle: (next: boolean) => void;
    mark: ReactNode;
    trailing: ReactNode;
}

/** Пропсы пункта наполнения: одинаковы для чекбокса и тумблера во всех видах. */
export const compositionItemProps = (
    editor: CompositionEditorState,
    kind: SectionKind,
    item: CompositionSectionItemView,
): CompositionItemProps => ({
    name: item.name,
    checked: item.checked,
    disabled: item.lt?.locked,
    onToggle: next => editor.toggleItem(kind, item.code, next),
    mark: <WeightMark value={item.mark} kind={editor.view.markKind} />,
    trailing: item.lt ? (
        <LtItemControls
            lt={item.lt}
            onMove={
                editor.freeMode
                    ? to => editor.applyComposition({ kind: 'moveLt', code: item.code, to })
                    : undefined
            }
            onSubtitle={(code, subtitle) => editor.applyComposition({ kind: 'setLtSubtitle', code, subtitle })}
        />
    ) : null,
});
