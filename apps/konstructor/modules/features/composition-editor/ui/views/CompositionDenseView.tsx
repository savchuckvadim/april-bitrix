'use client';

import { CompositionSwitchRow } from '../CompositionSwitchRow';
import { LtPacketsStrip } from '../LtPacketsStrip';
import { compositionItemProps } from './composition-item-props';
import type { CompositionViewProps } from './types';

/**
 * «Плотно»: колонки строк с тумблерами — максимум блоков на экран. Категории
 * не разрываются между колонками; фильтр «только выбранные» — в шапке.
 */
export const CompositionDenseView = ({ editor }: CompositionViewProps) => {
    const { sections, onlyChecked } = editor.sections;

    return (
        <div className="gap-6 md:columns-2 xl:columns-3">
            {sections.map(section => {
                const items = onlyChecked ? section.checkedItems : section.items;
                if (!items.length) return null;
                return (
                    <section key={section.code} className="mb-3 break-inside-avoid">
                        <header className="flex items-baseline gap-2 px-2 py-1 text-[0.6875rem] font-semibold tracking-wider text-muted-foreground uppercase">
                            <h3 className="min-w-0 truncate">{section.title}</h3>
                            {section.weight !== null ? (
                                <span className="ml-auto font-medium tracking-normal tabular-nums">
                                    {section.weight}
                                </span>
                            ) : null}
                        </header>
                        {section.kind === 'lt' ? (
                            <div className="px-2 pb-1">
                                <LtPacketsStrip packets={editor.ltPackets} />
                            </div>
                        ) : null}
                        {items.map(item => (
                            <CompositionSwitchRow
                                key={item.code}
                                {...compositionItemProps(editor, section.kind, item)}
                            />
                        ))}
                    </section>
                );
            })}
        </div>
    );
};
