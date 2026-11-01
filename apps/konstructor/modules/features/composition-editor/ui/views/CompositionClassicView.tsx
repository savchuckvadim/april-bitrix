'use client';

import { CompositionCheckbox } from '../CompositionCheckbox';
import { LtPacketsStrip } from '../LtPacketsStrip';
import { compositionItemProps } from './composition-item-props';
import type { CompositionViewProps } from './types';

/**
 * «Классика»: как в старом конструкторе — категории в две колонки, блоки
 * внутри категории сверху вниз. Неотмеченные блоки категории можно убрать с
 * экрана, тогда остаётся только состав.
 */
export const CompositionClassicView = ({ editor }: CompositionViewProps) => (
    <div className="grid gap-x-8 gap-y-5 md:grid-cols-2">
        {editor.sections.sections.map(section => (
            <section key={section.code} className="min-w-0">
                <header className="flex items-baseline gap-2 px-2 pb-1">
                    <h3 className="min-w-0 truncate text-sm font-semibold">{section.title}</h3>
                    <span className="shrink-0 text-[0.6875rem] text-muted-foreground/70">
                        {section.checkedItems.length} из {section.items.length}
                    </span>
                    {section.weight !== null ? (
                        <span className="shrink-0 text-[0.6875rem] text-muted-foreground/70 tabular-nums">
                            вес {section.weight}
                        </span>
                    ) : null}
                    <button
                        type="button"
                        onClick={() => editor.sections.toggleSection(section.code)}
                        className="ml-auto shrink-0 cursor-pointer text-[0.6875rem] text-muted-foreground underline decoration-dotted underline-offset-2 hover:text-foreground"
                    >
                        {section.isOpen ? 'скрыть неотмеченные' : 'показать все'}
                    </button>
                </header>
                {section.kind === 'lt' ? (
                    <div className="px-2 pb-1">
                        <LtPacketsStrip packets={editor.ltPackets} />
                    </div>
                ) : null}
                <div className="flex flex-col">
                    {section.visibleItems.map(item => (
                        <CompositionCheckbox
                            key={item.code}
                            {...compositionItemProps(editor, section.kind, item)}
                        />
                    ))}
                    {!section.visibleItems.length ? (
                        <span className="px-2 py-1.5 text-sm text-muted-foreground">ничего не отмечено</span>
                    ) : null}
                </div>
            </section>
        ))}
    </div>
);
