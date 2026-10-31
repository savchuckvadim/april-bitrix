'use client';

import { CompositionSwitchRow } from '../CompositionSwitchRow';
import { WeightMark } from '../WeightMark';
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
                        {items.map(item => (
                            <CompositionSwitchRow
                                key={item.code}
                                name={item.name}
                                checked={item.checked}
                                onToggle={next => editor.toggleItem(section.kind, item.code, next)}
                                mark={<WeightMark value={item.mark} kind={editor.view.markKind} />}
                            />
                        ))}
                    </section>
                );
            })}
        </div>
    );
};
