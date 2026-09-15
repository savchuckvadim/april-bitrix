import type { FC } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { renderInline } from '../../lib/render-inline';
import type { TheoryGlossaryItem } from '../../theory-types';

interface TheoryGlossaryProps {
    items: TheoryGlossaryItem[];
}

/** Словарь: термин → определение, со ссылкой на главу, где термин раскрыт. */
export const TheoryGlossary: FC<TheoryGlossaryProps> = ({ items }) => (
    <dl className="divide-y rounded-xl border">
        {items.map(item => (
            <div
                key={item.term}
                className="grid gap-1 px-4 py-3 sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-4"
            >
                <dt className="text-foreground font-semibold">
                    {item.href ? (
                        <Link
                            href={item.href}
                            className="hover:text-primary focus-visible:outline-primary inline-flex items-center gap-1 rounded-sm focus-visible:outline-2"
                        >
                            {item.term}
                            <ArrowUpRight
                                className="text-primary size-3.5"
                                aria-hidden
                            />
                        </Link>
                    ) : (
                        item.term
                    )}
                </dt>
                <dd className="text-foreground/90 text-sm leading-relaxed">
                    {renderInline(item.definition)}
                </dd>
            </div>
        ))}
    </dl>
);
