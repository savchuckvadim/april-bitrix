'use client';

import { FC, useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import type { ZprCallView, ZprStageDict } from '../model';
import {
    ZPR_TOOLTIP_COMMENTS_LIMIT,
    zprCallMeta,
} from '../lib/zpr-call-meta';
import { ZprStageBar } from './ZprStageBar';

interface ZprCallRowProps {
    view: ZprCallView;
    dict?: ZprStageDict;
}

/**
 * Строка одного ЗПР: подпись (дата плана/исхода), полоска стадии и лента
 * комментариев элемента. Свежие записи ленты видны в тултипе полоски,
 * полная лента — по раскрытию (у давнего клиента записей десятки).
 */
export const ZprCallRow: FC<ZprCallRowProps> = ({ view, dict }) => {
    const [expanded, setExpanded] = useState(false);
    const meta = zprCallMeta(view);
    const comments = view.call.comments;
    const tooltipComments = comments.slice(0, ZPR_TOOLTIP_COMMENTS_LIMIT);

    return (
        <li
            className={cn(
                'rounded-md border border-border px-2 py-1.5',
                view.isClosed && 'opacity-70',
            )}
        >
            {meta && (
                <div className="flex items-baseline justify-between gap-2 text-[0.6875rem] leading-tight text-muted-foreground">
                    <span className="min-w-0 truncate">{meta}</span>
                </div>
            )}
            <ZprStageBar
                stageId={view.call.stageId}
                dict={dict}
                title={view.call.title}
                withLabel
                note={
                    tooltipComments.length ? (
                        <div className="space-y-0.5">
                            {tooltipComments.map((comment, index) => (
                                <p
                                    key={index}
                                    className="max-w-64 truncate text-primary-foreground/70"
                                >
                                    {comment}
                                </p>
                            ))}
                        </div>
                    ) : undefined
                }
            />
            {comments.length > 0 && (
                <div className="mt-1">
                    <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-[0.6875rem] text-muted-foreground"
                        onClick={() => setExpanded(value => !value)}
                    >
                        {expanded
                            ? 'Свернуть комментарии'
                            : `Комментарии (${comments.length})`}
                    </Button>
                    {expanded && (
                        <ul className="mt-1 space-y-1 border-l-2 border-border pl-2">
                            {comments.map((comment, index) => (
                                <li
                                    key={index}
                                    className="whitespace-pre-wrap break-words text-xs text-muted-foreground"
                                >
                                    {comment}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </li>
    );
};
