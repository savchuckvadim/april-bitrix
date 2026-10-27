'use client';

import { FC, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { TONE_SOFT } from '@workspace/april-ui';
import { cn } from '@workspace/ui/lib/utils';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    applyBadgeToComment,
    selectCommentBadges,
} from '@/modules/entities/BadgeCatalog';
import {
    EV_REPORT_PROP,
    setAndSaveComment,
} from '@/modules/entities/EventReport';

/**
 * Готовые ответы под полем комментария.
 *
 * Набор зависит от выбранного итога работы: при «Отказе» — причины отказа,
 * при «Отложено» — почему отложили, после презентации — что по ней. Нажатие
 * ставит текст в поле, не отправляет: детали менеджер дописывает сам.
 *
 * Видны всегда, пока поле пустое или заполнено ими же. Начал печатать сам —
 * ряд сворачивается в строку «Готовые ответы», чтобы не мешать (решение
 * владельца 27.10.2026). Наведение не используется: менеджеры работают с
 * планшета.
 */
export const CommentBadges: FC = () => {
    const dispatch = useAppDispatch();
    const badges = useAppSelector(selectCommentBadges);
    const comment = useAppSelector(
        s => s.eventReport.report[EV_REPORT_PROP.COMMENT],
    );
    // Что в поле стояло после последнего нажатия бейджика: отличает «набрал
    // бейджиками» от «пишет сам» — и ряд не сворачивается после первого клика.
    const [lastApplied, setLastApplied] = useState('');
    const [expanded, setExpanded] = useState(false);

    if (!badges.length) return null;

    const typedByHand = comment.trim().length > 0 && comment !== lastApplied;
    const collapsed = typedByHand && !expanded;

    const apply = (text: string) => {
        const next = applyBadgeToComment(comment, text);
        setLastApplied(next);
        setExpanded(false);
        void dispatch(setAndSaveComment(next));
    };

    if (collapsed) {
        return (
            <button
                type="button"
                onClick={() => setExpanded(true)}
                className="flex items-center gap-1 text-[0.6875rem] text-muted-foreground hover:text-foreground"
            >
                <ChevronDown aria-hidden className="size-3" />
                Готовые ответы ({badges.length})
            </button>
        );
    }

    return (
        <div
            role="group"
            aria-label="Готовые ответы"
            className="flex flex-wrap items-center gap-1"
        >
            {badges.map(badge => (
                <button
                    key={badge.code}
                    type="button"
                    title={badge.text}
                    onClick={() => apply(badge.text)}
                    className={cn(
                        'max-w-full truncate rounded-md px-2 py-0.5 text-xs font-medium transition-opacity',
                        'hover:opacity-80 focus-visible:ring-ring/50 outline-none focus-visible:ring-[3px]',
                        TONE_SOFT[badge.tone],
                    )}
                >
                    {badge.text}
                </button>
            ))}
        </div>
    );
};
