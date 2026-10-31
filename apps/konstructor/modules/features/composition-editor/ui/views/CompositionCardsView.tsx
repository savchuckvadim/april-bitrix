'use client';

import { CompositionSectionBlock } from '../CompositionSectionBlock';
import { LtPacketsStrip } from '../LtPacketsStrip';
import { compositionItemProps } from './composition-item-props';
import type { CompositionViewProps } from './types';

/** «Карточки»: категории сворачиваются, свёрнутая показывает только отмеченное. */
export const CompositionCardsView = ({ editor }: CompositionViewProps) => (
    <>
        {editor.sections.sections.map(section => (
            <CompositionSectionBlock
                key={section.code}
                section={section}
                extra={section.kind === 'lt' ? <LtPacketsStrip packets={editor.ltPackets} /> : null}
                itemProps={item => compositionItemProps(editor, section.kind, item)}
                onToggleOpen={() => editor.sections.toggleSection(section.code)}
            />
        ))}
    </>
);
