'use client';

import type { CompositionEditorState } from '../hooks/use-composition-editor';
import { toggleSectionItem } from '../lib/composition-sections.util';
import { CompositionMessages } from './CompositionMessages';
import { CompositionLtOtherBlock } from './CompositionLtOtherBlock';
import { CompositionSectionBlock } from './CompositionSectionBlock';
import { CompositionServicesBlock } from './CompositionServicesBlock';

export interface CompositionEditorBodyProps {
    editor: CompositionEditorState;
}

/**
 * Категории наполнения (свёрнутая — только отмеченное), пакеты LT-other и
 * сервисы строки. Одно тело для панели шага «Комплект» и окна товара на «Ценах».
 */
export const CompositionEditorBody = ({ editor }: CompositionEditorBodyProps) => {
    const { composition, sections } = editor;
    if (!composition) return null;

    return (
        <div className="flex flex-col gap-3">
            <CompositionMessages result={editor.lastResult} />
            {sections.sections.map(section => (
                <CompositionSectionBlock
                    key={section.code}
                    title={section.title}
                    total={section.items.length}
                    checkedCount={section.checkedCount}
                    isOpen={section.isOpen}
                    visibleItems={section.visibleItems}
                    isChecked={section.isChecked}
                    onToggleOpen={() => sections.toggleSection(section.code)}
                    onToggleItem={(code, next) =>
                        editor.applyComposition(
                            toggleSectionItem(section.kind, code, next),
                        )
                    }
                />
            ))}
            <CompositionLtOtherBlock
                composition={composition}
                catalog={editor.catalog}
                serviceDepartment={editor.serviceDepartment}
                onApply={editor.applyComposition}
            />
            <div className="grid gap-4 rounded-lg border p-3 sm:grid-cols-2">
                <CompositionServicesBlock
                    composition={composition}
                    catalog={editor.catalog}
                    onApply={editor.applyComposition}
                />
            </div>
        </div>
    );
};
