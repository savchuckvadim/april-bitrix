'use client';

import { Button } from '@workspace/ui/components/button';
import type { CompositionEditorState } from '../hooks/use-composition-editor';

export interface UniversalComplectHintProps {
    editor: CompositionEditorState;
}

/**
 * Универсал: вес наполнения вышел за комплект. Подсказка, на какой комплект
 * подходит вес, и кнопка перехода; без автосмены.
 */
export const UniversalComplectHint = ({ editor }: UniversalComplectHintProps) => {
    const { text, target, switchComplect } = editor.universal;
    if (!text) return null;

    return (
        <div className="flex flex-wrap items-center gap-2 rounded-md bg-warning/10 px-3 py-2 text-xs text-warning">
            <span className="min-w-0 flex-1">{text}</span>
            {target ? (
                <Button variant="outline" size="sm" onClick={switchComplect}>
                    Перейти на «{target.title}»
                </Button>
            ) : null}
        </div>
    );
};
