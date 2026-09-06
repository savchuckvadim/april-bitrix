import { cn } from '@workspace/ui/lib/utils';
import { parseMarkdownLite } from '../../../lib/markdown-lite.util';
import { MarkdownInline } from './MarkdownInline';
import { MarkdownTable } from './MarkdownTable';

interface MarkdownLiteProps {
    markdown: string;
    className?: string;
}

/** Классы заголовков по уровню `#`: у отчёта h1 — титул, h2 — разделы, h4 — месяцы пивота. */
const HEADING_CLASS: Record<number, string> = {
    1: 'text-lg font-bold',
    2: 'mt-2 text-base font-semibold',
    3: 'text-sm font-semibold',
    4: 'text-sm font-medium text-muted-foreground',
    5: 'text-xs font-semibold',
    6: 'text-xs font-medium',
};

/**
 * Лёгкий рендер markdown отчёта аудита: заголовки, абзацы, списки,
 * таблицы и инлайн-жирный/код. Разбор — чистая `parseMarkdownLite`,
 * незнакомые конструкции остаются текстом.
 */
export const MarkdownLite = ({ markdown, className }: MarkdownLiteProps) => (
    <div className={cn('space-y-3 text-sm', className)}>
        {parseMarkdownLite(markdown).map((block, index) => {
            switch (block.kind) {
                case 'heading':
                    return (
                        <p
                            key={index}
                            className={HEADING_CLASS[block.level] ?? HEADING_CLASS[3]}
                        >
                            <MarkdownInline text={block.text} />
                        </p>
                    );
                case 'list':
                    return (
                        <ul key={index} className="list-disc space-y-1 pl-5">
                            {block.items.map((item, itemIndex) => (
                                <li key={itemIndex}>
                                    <MarkdownInline text={item} />
                                </li>
                            ))}
                        </ul>
                    );
                case 'table':
                    return (
                        <MarkdownTable
                            key={index}
                            headers={block.headers}
                            rows={block.rows}
                        />
                    );
                case 'paragraph':
                    return (
                        <p
                            key={index}
                            className={cn(
                                'whitespace-pre-line',
                                block.italic && 'italic text-muted-foreground',
                            )}
                        >
                            <MarkdownInline text={block.lines.join('\n')} />
                        </p>
                    );
                default:
                    return null;
            }
        })}
    </div>
);
