'use client';

import { MessageSquareWarning } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@workspace/ui/components/popover';
import { Textarea } from '@workspace/ui/components/textarea';
import {
    CALL_REVIEW_LIMITS,
    CALL_REVIEW_TEXT,
    type CallReviewTarget,
} from '@/modules/entities/call-review';
import { useCallReviewMark } from '../../model/use-call-review-mark';

const T = CALL_REVIEW_TEXT.mark;

interface CallReviewMarkButtonProps {
    /** Пункт разбора; null — отмечать нечего (кнопки нет). */
    target: CallReviewTarget | null;
}

/**
 * «Не так» у пункта разбора — только в режиме руководителя. Окно с полем
 * «Что не так»: замечание попадает в черновик отзыва и сохраняется вместе с
 * ним. Отмеченный пункт — кнопка залита, окно позволяет поменять или убрать.
 */
export const CallReviewMarkButton = ({ target }: CallReviewMarkButtonProps) => {
    const mark = useCallReviewMark(target);
    if (!mark.available || target === null) return null;

    return (
        <Popover open={mark.open} onOpenChange={mark.setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant={mark.marked ? 'destructive' : 'ghost'}
                    size="sm"
                    className="h-6 shrink-0 gap-1 px-2 text-xs"
                    title={T.title}
                    disabled={mark.disabled}
                >
                    <MessageSquareWarning aria-hidden className="size-3.5" />
                    {mark.marked ? T.marked : T.button}
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 space-y-2 p-3">
                <p className="text-sm font-medium">{T.heading}</p>
                <p className="text-xs text-muted-foreground">{target.label}</p>
                <Textarea
                    value={mark.comment}
                    onChange={event => mark.setComment(event.target.value)}
                    maxLength={CALL_REVIEW_LIMITS.itemComment}
                    placeholder={T.placeholder}
                    aria-label={T.heading}
                    className="min-h-24 text-sm"
                />
                {mark.counter && (
                    <p className="text-[0.6875rem] text-muted-foreground tabular-nums">
                        {mark.counter}
                    </p>
                )}
                {mark.full && (
                    <p className="text-xs text-warning">
                        {CALL_REVIEW_TEXT.items.limit(CALL_REVIEW_LIMITS.items)}
                    </p>
                )}
                <p className="text-[0.6875rem] text-muted-foreground">{T.note}</p>
                <div className="flex items-center justify-end gap-2">
                    {mark.marked && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={mark.remove}
                        >
                            {T.remove}
                        </Button>
                    )}
                    <Button
                        type="button"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        disabled={mark.full}
                        onClick={mark.apply}
                    >
                        {mark.marked ? T.update : T.add}
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
};
