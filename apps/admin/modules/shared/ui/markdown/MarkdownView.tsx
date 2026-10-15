'use client';

import { createElement, Fragment, useMemo, type ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@workspace/ui/lib/utils';
import {
    parseMarkdown,
    type MarkdownBlock,
    type MarkdownHeadingLevel,
    type MarkdownInline,
} from './parse-markdown';

interface MarkdownViewProps {
    /** Markdown-текст; разбирается чистой `parseMarkdown`. */
    text: string;
    className?: string;
}

const HEADING_CLASS: Record<MarkdownHeadingLevel, string> = {
    1: 'text-lg font-bold',
    2: 'mt-4 text-base font-semibold first:mt-0',
    3: 'mt-3 text-sm font-semibold first:mt-0',
    4: 'mt-2 text-sm font-medium',
    5: 'text-xs font-semibold',
    6: 'text-xs font-medium text-muted-foreground',
};

const LINK_CLASS = 'text-primary underline underline-offset-2 hover:opacity-80';
const CODE_CLASS = 'rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]';

const isExternalHref = (href: string): boolean => /^https?:\/\//i.test(href);

const renderInline = (nodes: MarkdownInline[]): ReactNode =>
    nodes.map((node, index) => {
        switch (node.type) {
            case 'text':
                return <Fragment key={index}>{node.value}</Fragment>;
            case 'code':
                return (
                    <code key={index} className={CODE_CLASS}>
                        {node.value}
                    </code>
                );
            case 'bold':
                return (
                    <strong key={index} className="font-semibold text-foreground">
                        {renderInline(node.children)}
                    </strong>
                );
            case 'italic':
                return <em key={index}>{renderInline(node.children)}</em>;
            case 'link':
                return isExternalHref(node.href) ? (
                    <a
                        key={index}
                        href={node.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={LINK_CLASS}
                    >
                        {renderInline(node.children)}
                    </a>
                ) : (
                    <Link key={index} href={node.href} className={LINK_CLASS}>
                        {renderInline(node.children)}
                    </Link>
                );
            default:
                return null;
        }
    });

const renderBlock = (block: MarkdownBlock, index: number): ReactNode => {
    switch (block.type) {
        case 'heading':
            return createElement(
                `h${block.level}`,
                { key: index, className: HEADING_CLASS[block.level] },
                renderInline(block.children),
            );
        case 'paragraph':
            return (
                <p key={index} className="leading-relaxed">
                    {renderInline(block.children)}
                </p>
            );
        case 'list':
            return createElement(
                block.ordered ? 'ol' : 'ul',
                {
                    key: index,
                    className: cn(
                        'space-y-1 pl-5',
                        block.ordered ? 'list-decimal' : 'list-disc',
                    ),
                },
                block.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="leading-relaxed">
                        {renderInline(item)}
                    </li>
                )),
            );
        case 'table':
            return (
                <div key={index} className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr>
                                {block.header.map((cell, cellIndex) => (
                                    <th
                                        key={cellIndex}
                                        className="border bg-muted/50 px-2 py-1 text-left align-top font-semibold"
                                    >
                                        {renderInline(cell)}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {block.rows.map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                    {row.map((cell, cellIndex) => (
                                        <td
                                            key={cellIndex}
                                            className="border px-2 py-1 align-top"
                                        >
                                            {renderInline(cell)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        case 'blockquote':
            return (
                <blockquote
                    key={index}
                    className="space-y-2 border-l-4 border-muted pl-3 text-muted-foreground"
                >
                    {block.children.map(renderBlock)}
                </blockquote>
            );
        case 'code':
            return (
                <pre
                    key={index}
                    className="overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs leading-relaxed"
                    data-language={block.language ?? undefined}
                >
                    <code>{block.value}</code>
                </pre>
            );
        case 'rule':
            return <hr key={index} className="my-2 border-border" />;
        default:
            return null;
    }
};

/**
 * Рендер markdown в React-элементы — без `dangerouslySetInnerHTML` и
 * сторонних библиотек. Внешние ссылки открываются в новой вкладке с
 * `rel="noopener noreferrer"`, внутренние — через `next/link`.
 */
export const MarkdownView = ({ text, className }: MarkdownViewProps) => {
    const blocks = useMemo(() => parseMarkdown(text), [text]);
    return (
        <div className={cn('space-y-3 text-sm', className)}>
            {blocks.map(renderBlock)}
        </div>
    );
};
