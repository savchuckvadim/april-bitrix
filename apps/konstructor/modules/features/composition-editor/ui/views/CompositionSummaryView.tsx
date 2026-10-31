'use client';

import { LtPacketsStrip } from '../LtPacketsStrip';
import { compositionItemProps } from './composition-item-props';
import type { CompositionViewProps } from './types';
import { CompositionSummaryRow } from './CompositionSummaryRow';

/** «Сводка»: состав читается как текст КП, блоки правятся по клику на категорию. */
export const CompositionSummaryView = ({ editor }: CompositionViewProps) => (
    <div className="flex flex-col">
        {editor.sections.sections.map(section => (
            <CompositionSummaryRow
                key={section.code}
                section={section}
                extra={section.kind === 'lt' ? <LtPacketsStrip packets={editor.ltPackets} /> : null}
                itemProps={item => compositionItemProps(editor, section.kind, item)}
            />
        ))}
    </div>
);
