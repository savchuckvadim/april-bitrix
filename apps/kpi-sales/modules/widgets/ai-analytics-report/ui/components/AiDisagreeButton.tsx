'use client';

import { MessageSquareWarning, Send } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@workspace/ui/components/popover';
import { Textarea } from '@workspace/ui/components/textarea';
import { AI_DISAGREE_REASON_MAX } from '@/modules/entities/ai-analytics';
import { useAiDisagree } from '../../hooks/use-ai-disagree';

interface AiDisagreeButtonProps {
    managerId: string;
}

/**
 * «Не согласен» со строкой обзора: по клику — popover с необязательной
 * причиной (≤ 300 символов, счётчик) и «Отправить» → feedback disagree
 * по менеджеру. Логика — useAiDisagree.
 */
export const AiDisagreeButton = ({ managerId }: AiDisagreeButtonProps) => {
    const {
        open,
        setOpen,
        reason,
        setReason,
        counter,
        pending,
        disagreed,
        disabled,
        submit,
    } = useAiDisagree(managerId);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant={disagreed ? 'default' : 'ghost'}
                    size="sm"
                    className="h-7 gap-1 px-2 text-xs"
                    disabled={disabled}
                    title={
                        disagreed
                            ? 'Несогласие записано'
                            : 'Не согласен с разбором'
                    }
                >
                    <MessageSquareWarning className="h-3.5 w-3.5" />
                    {disagreed ? 'Записано' : 'Не согласен'}
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 space-y-2 p-3">
                <p className="text-sm font-medium">Не согласен с разбором</p>
                <Textarea
                    value={reason}
                    onChange={event => setReason(event.target.value)}
                    maxLength={AI_DISAGREE_REASON_MAX}
                    placeholder="Причина (необязательно)"
                    className="min-h-20 text-sm"
                    disabled={pending}
                    aria-label="Причина несогласия"
                />
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
