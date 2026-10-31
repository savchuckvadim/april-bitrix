'use client';

import { cn } from '@workspace/ui/lib/utils';
import { CompositionCheckbox } from '../CompositionCheckbox';
import { LtPacketsStrip } from '../LtPacketsStrip';
import { compositionItemProps } from './composition-item-props';
import type { CompositionViewProps } from './types';

/**
 * «Секции»: одна поверхность без карточек, все блоки на виду, категории
 * разделены воздухом и мелким заголовком со счётчиком и весом категории.
 */
export const CompositionFlatView = ({ editor }: CompositionViewProps) => (
    <div className="flex flex-col gap-4">
        {editor.sections.sections.map(section => (
            <section key={section.code}>
                <header className="flex items-baseline gap-2 px-2 pb-1">
                    <h3 className="text-[0.6875rem] font-semibold tracking-wider text-muted-foreground uppercase">
                        {section.title}
                    </h3>
                    <span className="text-[0.6875rem] text-muted-foreground/70">
                        {section.checkedItems.length} из {section.items.length}
                    </span>
                    {section.weight !== null ? (
                        <span className="ml-auto text-[0.6875rem] text-muted-foreground/70 tabular-nums">
                            {section.weight}
                        </span>
                    ) : null}
                </header>
                {section.kind === 'lt' ? (
                    <div className="px-2 pb-1">
                        <LtPacketsStrip packets={editor.ltPackets} />
                    </div>
                ) : null}
                <div className="grid gap-x-3 sm:grid-cols-2 xl:grid-cols-3 min-[1800px]:grid-cols-4">
                    {section.items.map(item => (
                        <div key={item.code} className={cn(!item.checked && 'text-muted-foreground')}>
                            <CompositionCheckbox {...compositionItemProps(editor, section.kind, item)} />
                        </div>
                    ))}
                </div>
            </section>
        ))}
    </div>
);
