'use client';

import { FC } from 'react';
import { Lightbulb } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import { useActionPrompts } from '../lib/hooks/use-action-prompts';

const TONE_BORDER = {
    info: 'border-l-[var(--event-current)]',
    warning: 'border-l-warning',
    success: 'border-l-success',
} as const;

/**
 * Всплывающая подсказка в углу экрана: вопрос и одна кнопка.
 *
 * Не модалка: подсказка не должна останавливать работу — она предлагает, а не
 * требует. И не строка в списке предупреждений: там она молчала бы вместе с
 * остальными, и до неё никто не дошёл бы.
 *
 * На экране всегда ОДНА — самая важная. Остальные подождут своей очереди или
 * исчезнут сами, когда повод пропадёт.
 */
export const ActionPromptCard: FC = () => {
    const prompts = useActionPrompts();
    const prompt = prompts.current;

    if (!prompt) return null;

    return (
        <div
            className={cn(
                'fixed bottom-3 right-3 z-40 w-72 rounded-lg border border-l-[3px] border-border bg-card p-2.5 shadow-lg',
                'duration-300 animate-in fade-in slide-in-from-bottom-2 motion-reduce:animate-none',
                TONE_BORDER[prompt.tone],
            )}
        >
            <div className="flex items-start gap-2">
                <Lightbulb
                    aria-hidden
                    className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
                />
                <div className="min-w-0 space-y-1">
                    <p className="text-xs font-medium">{prompt.question}</p>
                    {prompt.hint && (
                        <p className="text-[0.6875rem] text-muted-foreground">
                            {prompt.hint}
                        </p>
                    )}
                </div>
            </div>

            <div className="mt-2 flex items-center justify-end gap-1.5">
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs text-muted-foreground"
                    onClick={prompts.dismiss}
                >
                    Позже
                </Button>
                <Button
                    size="sm"
                    className="h-7 px-2.5 text-xs"
                    onClick={() => {
                        prompt.run();
                        prompts.dismiss();
                    }}
                >
                    {prompt.actionLabel}
                </Button>
            </div>
        </div>
    );
};
