'use client';

import { CompositionSectionBlock } from '../CompositionSectionBlock';
import type { CompositionViewProps } from './types';

/** «Карточки»: категории сворачиваются, свёрнутая показывает только отмеченное. */
export const CompositionCardsView = ({ editor }: CompositionViewProps) => (
    <>
        {editor.sections.sections.map(section => (
            <CompositionSectionBlock
                key={section.code}
                section={section}
                markKind={editor.view.markKind}
                onToggleOpen={() => editor.sections.toggleSection(section.code)}
                onToggleItem={(code, next) => editor.toggleItem(section.kind, code, next)}
            />
        ))}
    </>
);
