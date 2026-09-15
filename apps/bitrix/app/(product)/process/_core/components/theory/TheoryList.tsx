import type { FC } from 'react';
import { renderInline } from '../../lib/render-inline';

interface TheoryListProps {
    items: string[];
    /** Нумерованный список вместо маркированного. */
    ordered?: boolean;
}

/** Список из строк с инлайн-разметкой. */
export const TheoryList: FC<TheoryListProps> = ({ items, ordered = false }) => {
    const Tag = ordered ? 'ol' : 'ul';

    return (
        <Tag
            className={
                ordered
                    ? 'text-foreground/90 max-w-3xl list-decimal space-y-1.5 pl-6'
                    : 'text-foreground/90 max-w-3xl list-disc space-y-1.5 pl-6'
            }
        >
            {items.map((item, index) => (
                <li key={index} className="leading-relaxed">
                    {renderInline(item)}
                </li>
            ))}
        </Tag>
    );
};
