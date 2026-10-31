'use client';

import type { CompositionViewProps } from './types';
import { CompositionSummaryRow } from './CompositionSummaryRow';

/** «Сводка»: состав читается как текст КП, блоки правятся по клику на категорию. */
export const CompositionSummaryView = ({ editor }: CompositionViewProps) => (
    <div className="flex flex-col">
        {editor.sections.sections.map(section => (
            <CompositionSummaryRow
                key={section.code}
                section={section}
                markKind={editor.view.markKind}
                onToggleItem={(code, next) => editor.toggleItem(section.kind, code, next)}
            />
        ))}
    </div>
);
