'use client';

import { MessageSquareWarning, Send } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@workspace/ui/components/popover';
import { Textarea } from '@workspace/ui/components/textarea';
import { MicroSelect } from '@workspace/april-ui';
import { useAiDisagree } from '../../hooks/use-ai-disagree';
import { AiFeedbackError } from './AiFeedbackError';
import { AiReadOnlyHint } from './AiReadOnlyHint';

interface AiDisagreeButtonProps {
    managerId: string;
}

/**
 * «Не согласен» со строкой обзора: по клику — popover с причиной из
 * списка и необязательным комментарием (общий лимит 300 символов,
 * счётчик) и «Отправить» → feedback disagree по менеджеру одной строкой
 * reason. Ошибка записи — в popover, «Отправить» повторяет. В режиме
 * «Смотреть как…» кнопка неактивна с подсказкой. Логика — useAiDisagree.
 */
export const AiDisagreeButton = ({ managerId }: AiDisagreeButtonProps) => {
    const {
        open,
        setOpen,
        reasonOptions,
        reasonCode,
        setReasonCode,
        comment,
        setComment,
        commentMax,
        counter,
        pending,
        disagreed,
        error,
        readOnlyHint,
        disabled,
        submit,
    } = useAiDisagree(managerId);

    const trigger = (
        <Button
            variant={disagreed ? 'default' : 'ghost'}
            size="sm"
            className="h-7 gap-1 px-2 text-xs"
            disabled={disabled}
            title={
                readOnlyHint
                    ? undefined
                    : disagreed
                      ? 'Несогласие записано'
                      : 'Не согласен с разбором'
            }
        >
            <MessageSquareWarning className="h-3.5 w-3.5" />
            {disagreed ? 'Записано' : 'Не согласен'}
        </Button>
    );

    if (readOnlyHint) {
        return <AiReadOnlyHint hint={readOnlyHint}>{trigger}</AiReadOnlyHint>;
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>{trigger}</PopoverTrigger>
            <PopoverContent align="end" className="w-80 space-y-2 p-3">
                <p className="text-sm font-medium">Не согласен с разбором</p>
                <MicroSelect
                    ariaLabel="Причина несогласия"
                    value={reasonCode ?? ''}
                    options={reasonOptions}
                    placeholder="Причина (необязательно)"
                    disabled={pending}
                    className="max-w-full"
                    onChange={setReasonCode}
                />
                <Textarea
                    value={comment}
                    onChange={event => setComment(event.target.value)}
                    maxLength={commentMax}
                    placeholder="Комментарий (необязательно)"
                    className="min-h-20 text-sm"
                    disabled={pending}
                    aria-label="Комментарий к несогласию"
                />
                <AiFeedbackError error={error} className="block" />
                <div className="flex items-center justify-between gap-2">
                    <span className="text-[0.6875rem] text-muted-foreground tabular-nums">
                        {counter}
                    </span>
                    <Button
                        size="sm"
                        className="h-7 gap-1 px-2 text-xs"
                        disabled={pending}
                        onClick={() => void submit()}
                    >
                        <Send className="h-3.5 w-3.5" />
                        Отправить
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
};
